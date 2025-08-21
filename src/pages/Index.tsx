import { useState, useMemo } from 'react';
import { FileUpload, YouthRecord } from '@/components/FileUpload';
import { FilterPanel, FilterState } from '@/components/FilterPanel';
import { DataTable } from '@/components/DataTable';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [data, setData] = useState<YouthRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    gender: [],
    nationality: [],
    ageRange: { min: 0, max: 100 },
    degree: [],
    qualification: [],
    status: [],
    search: ''
  });

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    return data.filter(record => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          record['First Name'],
          record['Last Name'],
          record.Email,
          record.Nationality,
          record.Degree,
          record.Qualification
        ];
        const matchesSearch = searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        );
        if (!matchesSearch) return false;
      }

      // Gender filter
      if (filters.gender.length > 0 && !filters.gender.includes(record.Gender)) {
        return false;
      }

      // Nationality filter
      if (filters.nationality.length > 0 && !filters.nationality.includes(record.Nationality)) {
        return false;
      }

      // Age range filter
      if (record.Age < filters.ageRange.min || record.Age > filters.ageRange.max) {
        return false;
      }

      // Degree filter
      if (filters.degree.length > 0 && !filters.degree.includes(record.Degree)) {
        return false;
      }

      // Qualification filter
      if (filters.qualification.length > 0 && !filters.qualification.includes(record.Qualification)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(record.Status)) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const handleDataLoaded = (newData: YouthRecord[]) => {
    setData(newData);
    // Reset age range filters when new data is loaded
    const ages = newData.map(record => record.Age).filter(age => !isNaN(age));
    setFilters(prev => ({
      ...prev,
      ageRange: {
        min: Math.min(...ages),
        max: Math.max(...ages)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AU Youth Division
              </h1>
              <p className="text-muted-foreground mt-1">
                Data Management & Analytics Platform
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                African Union Youth Division
              </div>
              <div className="text-sm font-medium text-primary">
                Data Explorer
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          {data.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <FileUpload onDataLoaded={handleDataLoaded} />
            </div>
          )}

          {/* Data Management Section */}
          {data.length > 0 && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 gradient-card shadow-card border-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{data.length}</div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                </Card>
                <Card className="p-6 gradient-card shadow-card border-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{filteredData.length}</div>
                    <div className="text-sm text-muted-foreground">Filtered Results</div>
                  </div>
                </Card>
                <Card className="p-6 gradient-card shadow-card border-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {new Set(data.map(r => r.Nationality)).size}
                    </div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                </Card>
                <Card className="p-6 gradient-card shadow-card border-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {Math.round(data.reduce((sum, r) => sum + r.Age, 0) / data.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Age</div>
                  </div>
                </Card>
              </div>

              {/* Filter and Data Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <FilterPanel
                    data={data}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </div>
                <div className="lg:col-span-3">
                  <DataTable data={data} filteredData={filteredData} />
                </div>
              </div>

              {/* Upload New File Button */}
              <div className="text-center pt-8 border-t border-border/50">
                <div className="max-w-md mx-auto">
                  <FileUpload onDataLoaded={handleDataLoaded} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;