import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TableFilterOption {
  value: string;
  label: string;
}

export function useTableControls<T>(
  items: T[],
  getSearchText: (item: T) => string,
  getFilterValue?: (item: T) => string | string[],
  pageSize = 10
) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        getSearchText(item).toLowerCase().includes(normalizedSearch);
      const itemFilter = getFilterValue?.(item);
      const matchesFilter =
        !filter ||
        !itemFilter ||
        (Array.isArray(itemFilter)
          ? itemFilter.includes(filter)
          : itemFilter === filter);
      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter, getSearchText, getFilterValue]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  useEffect(() => setPage(1), [search, filter]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return {
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    totalItems: filteredItems.length,
    pageItems: filteredItems.slice((page - 1) * pageSize, page * pageSize),
  };
}

interface TableControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  filterOptions?: TableFilterOption[];
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function TableControls({
  search,
  onSearchChange,
  filter = '',
  onFilterChange,
  filterLabel = 'Filter',
  filterOptions = [],
}: TableControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] max-w-md flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('searchThisTable')}
            className="input-field w-full pl-9"
          />
        </label>
        {onFilterChange && filterOptions.length > 0 && (
          <select
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            aria-label={filterLabel}
            className="input-field w-auto min-w-[150px]"
          >
            <option value="">{t('allTableFilters', { filter: t(filterLabel) })}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export function TablePagination({ page, totalPages, totalItems, onPageChange }: Pick<TableControlsProps, 'page' | 'totalPages' | 'totalItems' | 'onPageChange'>) {
  const { t } = useTranslation();
  const rangeStart = totalItems ? (page - 1) * 10 + 1 : 0;
  const rangeEnd = Math.min(page * 10, totalItems);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-slate-100 text-sm text-slate-500">
      <span>{t('tableResultRange', { start: rangeStart, end: rangeEnd, total: totalItems })}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary px-3 py-1.5 disabled:opacity-40">{t('previous')}</button>
        <span>{page} / {totalPages}</span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn-secondary px-3 py-1.5 disabled:opacity-40">{t('next')}</button>
      </div>
    </div>
  );
}
