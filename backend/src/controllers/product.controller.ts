import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Get all products with optional search/filter.
 */
export const getProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      category_id,
      min_price,
      max_price,
      availability,
      factory_id,
      page = '1',
      limit = '12',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { product_name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }
    if (category_id) where.category_id = parseInt(category_id as string);
    if (factory_id) where.factory_id = parseInt(factory_id as string);
    if (availability) where.availability_status = availability;
    if (min_price || max_price) {
      where.price = {
        ...(min_price ? { gte: parseFloat(min_price as string) } : {}),
        ...(max_price ? { lte: parseFloat(max_price as string) } : {}),
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          factory: { select: { factory_name: true, location: true } },
          category: { select: { category_name: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('GetProducts error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * Get single product by ID.
 */
export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
      include: {
        factory: {
          include: {
            user: {
              select: { full_name: true, email: true, phone_number: true },
            },
          },
        },
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Log search/view history if buyer is authenticated
    if (req.user?.role === 'BUYER') {
      const buyer = await prisma.buyer.findUnique({
        where: { user_id: req.user.user_id },
      });
      if (buyer) {
        await prisma.searchhistory.create({
          data: {
            buyer_id: buyer.buyer_id,
            search_keyword: product.product_name,
            viewed_category: product.category.category_name,
          },
        });
      }
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('GetProductById error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch product' });
  }
};

/**
 * Create a new product (Factory or Admin).
 */
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      product_name,
      description,
      price,
      stock_quantity,
      category_id,
      availability_status,
    } = req.body;
    const file = req.file as Express.Multer.File & {
      secure_url?: string;
      url?: string;
      path?: string;
      filename?: string;
    };
    const image = req.file
      ? file.secure_url || file.url || file.path || `/uploads/${file.filename}`
      : null;

   let factory_id: number | null = null;

    if (req.user!.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!factory) {
        res
          .status(404)
          .json({ success: false, message: 'Factory profile not found' });
        return;
      }
      if (factory.approval_status !== 'APPROVED') {
        res
          .status(403)
          .json({ success: false, message: 'Factory not yet approved' });
        return;
      }
      factory_id = factory.factory_id;
    } else if (req.user!.role === 'ADMIN') {
  // Factory is optional for admin
  factory_id = req.body.factory_id
    ? parseInt(req.body.factory_id)
    : null;
}

    const admin =
      req.user!.role === 'ADMIN'
        ? await prisma.admin.findUnique({
            where: { user_id: req.user!.user_id },
          })
        : null;

        const factory =
      req.user!.role === 'FACTORY'
        ? await prisma.factory.findUnique({
            where: { user_id: req.user!.user_id },
          })
        : null;

    const product = await prisma.product.create({
      data: {
        product_name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity) || 0,
        category_id: parseInt(category_id),
        factory_id: factory?.factory_id || undefined,
        availability_status: availability_status || 'AVAILABLE',
        created_by_admin: req.user!.role === 'ADMIN',
        admin_id: admin?.admin_id || undefined,
        image,
      },
      include: {
        factory: { select: { factory_name: true } },
        category: { select: { category_name: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to create product' });
  }
};

/**
 * Update a product.
 */
export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      product_name,
      description,
      price,
      stock_quantity,
      category_id,
      availability_status,
    } = req.body;

    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
      select: {
        product_id: true,
        factory_id: true,
        category_id: true,
        product_name: true,
        description: true,
        price: true,
        stock_quantity: true,
        availability_status: true,
        image: true,
        admin_id: true,
      },
    });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.user!.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!factory || factory.factory_id !== product.factory_id) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to update this product',
        });
        return;
      }
    }

    if (req.user!.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!admin || product.admin_id !== admin.admin_id) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to update this product',
        });
        return;
      }
    }

    const file = req.file as Express.Multer.File & {
      secure_url?: string;
      url?: string;
      path?: string;
      filename?: string;
    };
    const image = req.file
      ? file.secure_url || file.url || file.path || `/uploads/${file.filename}`
      : product.image;

    const updated = await prisma.product.update({
      where: { product_id: parseInt(id) },
      data: {
        product_name: product_name || product.product_name,
        description: description ?? product.description,
        price: price ? parseFloat(price) : product.price,
        stock_quantity:
          stock_quantity !== undefined
            ? parseInt(stock_quantity)
            : product.stock_quantity,
        category_id: category_id ? parseInt(category_id) : product.category_id,
        availability_status: availability_status || product.availability_status,
        image,
      },
      include: {
        factory: { select: { factory_name: true } },
        category: { select: { category_name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update product' });
  }
};

/**
 * Delete a product.
 */
export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
      select: {
        product_id: true,
        factory_id: true,
        category_id: true,
        product_name: true,
        description: true,
        price: true,
        stock_quantity: true,
        availability_status: true,
        image: true,
        admin_id: true,
      },
    });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.user!.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!factory || factory.factory_id !== product.factory_id) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to delete this product',
        });
        return;
      }
    }

    if (req.user!.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!admin || product.admin_id !== admin.admin_id) {
        res.status(403).json({
          success: false,
          message: 'Not authorized to delete this product',
        });
        return;
      }
    }

    await prisma.product.delete({ where: { product_id: parseInt(id) } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to delete product' });
  }
};

/**
 * Get products by factory.
 */
export const getFactoryProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    let factory_id: number;

    if (req.user!.role === 'FACTORY') {
      const factory = await prisma.factory.findUnique({
        where: { user_id: req.user!.user_id },
      });
      if (!factory) {
        res.status(404).json({ success: false, message: 'Factory not found' });
        return;
      }
      factory_id = factory.factory_id;
    } else {
      factory_id = parseInt(req.params.factory_id);
    }

    const products = await prisma.product.findMany({
      where: { factory_id },
      include: { category: true },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, products });
  } catch (error) {
    console.error('GetFactoryProducts error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch factory products' });
  }
};
