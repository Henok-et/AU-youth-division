import { useState } from 'react';
import { ChevronUp, ChevronDown, Users, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { YouthRecord } from './FileUpload';
import * as XLSX from 'xlsx';

interface DataTableProps {
  data: YouthRecord[];
  filteredData: YouthRecord[];
}

type SortField = keyof YouthRecord;
type SortDirection = 'asc' | 'desc';

export const DataTable = ({ data, filteredData }: DataTableProps) => {
  const [sortField, setSortField] = useState<SortField>('First Name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Filtered Youth Data');
    XLSX.writeFile(wb, `au-youth-data-filtered-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = Object.keys(filteredData[0] || {});
    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => 
        headers.map(header => `"${record[header as keyof YouthRecord]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `au-youth-data-filtered-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (data.length === 0) {
    return (
      <Card className="p-12 text-center gradient-card shadow-card border-0">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Upload an Excel file to view youth records</p>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card border-0">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Youth Records</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Showing {filteredData.length} of {data.length} records</span>
              {filteredData.length !== data.length && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Filtered
                </Badge>
              )}
            </div>
          </div>
          
          {filteredData.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="border-primary/20 hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="border-primary/20 hover:bg-primary/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          )}
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Results Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                {Object.keys(filteredData[0]).map((column) => (
                  <TableHead
                    key={column}
                    className="cursor-pointer hover:bg-muted/30 transition-smooth font-semibold"
                    onClick={() => handleSort(column as SortField)}
                  >
                    <div className="flex items-center gap-2">
                      {column}
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortField === column && sortDirection === 'asc'
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortField === column && sortDirection === 'desc'
                              ? 'text-primary'
                              : 'text-muted-foreground/50'
                          }`}
                        />
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((record, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/30 transition-smooth border-border/50"
                >
                  <TableCell className="font-medium">{record['First Name']}</TableCell>
                  <TableCell className="font-medium">{record['Last Name']}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20">
                      {record.Gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.Nationality}</TableCell>
                  <TableCell>{record.Age}</TableCell>
                  <TableCell>{record.Degree}</TableCell>
                  <TableCell>{record.Qualification}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{record.Email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={record.Status.toLowerCase().includes('active') ? 'default' : 'secondary'}
                      className={
                        record.Status.toLowerCase().includes('active')
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {record.Status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};