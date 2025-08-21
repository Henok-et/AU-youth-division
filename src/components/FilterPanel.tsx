import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { YouthRecord } from './FileUpload';

export interface FilterState {
  gender: string[];
  nationality: string[];
  ageRange: { min: number; max: number };
  degree: string[];
  qualification: string[];
  status: string[];
  search: string;
}

interface FilterPanelProps {
  data: YouthRecord[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterPanel = ({ data, filters, onFiltersChange }: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Extract unique values for each filterable column
  const uniqueValues = {
    gender: [...new Set(data.map(record => record.Gender).filter(Boolean))],
    nationality: [...new Set(data.map(record => record.Nationality).filter(Boolean))],
    degree: [...new Set(data.map(record => record.Degree).filter(Boolean))],
    qualification: [...new Set(data.map(record => record.Qualification).filter(Boolean))],
    status: [...new Set(data.map(record => record.Status).filter(Boolean))]
  };

  const ageRange = {
    min: Math.min(...data.map(record => record.Age).filter(age => !isNaN(age))),
    max: Math.max(...data.map(record => record.Age).filter(age => !isNaN(age)))
  };

  const handleMultiSelectChange = (field: Exclude<keyof FilterState, 'ageRange' | 'search'>, value: string) => {
    const currentValues = filters[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [field]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      gender: [],
      nationality: [],
      ageRange: { min: ageRange.min, max: ageRange.max },
      degree: [],
      qualification: [],
      status: [],
      search: ''
    });
  };

  const getActiveFilterCount = () => {
    return (
      filters.gender.length +
      filters.nationality.length +
      filters.degree.length +
      filters.qualification.length +
      filters.status.length +
      (filters.search ? 1 : 0) +
      ((filters.ageRange.min !== ageRange.min || filters.ageRange.max !== ageRange.max) ? 1 : 0)
    );
  };

  if (data.length === 0) return null;

  return (
    <Card className="gradient-card shadow-card border-0">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search</Label>
            <Input
              placeholder="Search names, email, etc..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="transition-smooth"
            />
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Age Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min age"
                value={filters.ageRange.min || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  ageRange: { ...filters.ageRange, min: parseInt(e.target.value) || ageRange.min }
                })}
                className="transition-smooth"
              />
              <Input
                type="number"
                placeholder="Max age"
                value={filters.ageRange.max || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  ageRange: { ...filters.ageRange, max: parseInt(e.target.value) || ageRange.max }
                })}
                className="transition-smooth"
              />
            </div>
          </div>

          {/* Multi-select filters */}
          {Object.entries(uniqueValues).map(([field, values]) => (
            <div key={field} className="space-y-2">
              <Label className="text-sm font-medium capitalize">{field}</Label>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const fieldKey = field as Exclude<keyof FilterState, 'ageRange' | 'search'>;
                  const isSelected = (filters[fieldKey] as string[]).includes(value);
                  return (
                    <Badge
                      key={value}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-smooth ${
                        isSelected
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-primary/10 hover:border-primary/50"
                      }`}
                      onClick={() => handleMultiSelectChange(fieldKey, value)}
                    >
                      {value}
                      {isSelected && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};