import React, { useState } from 'react';

interface FilterOptions {
  date?: [Date, Date];
  cropType?: string;
  severity?: string;
}

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  return (
    <div className="search-filters" role="search">
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search..."
        aria-label="Search input"
      />
      <div className="filters">
        <select
          onChange={(e) => {
            setFilters({ ...filters, cropType: e.target.value });
            onFilter({ ...filters, cropType: e.target.value });
          }}
          aria-label="Filter by crop type"
        >
          <option value="">All Crops</option>
          <option value="tomato">Tomato</option>
          <option value="lettuce">Lettuce</option>
        </select>
        {/* Add more filter controls as needed */}
      </div>
    </div>
  );
};
