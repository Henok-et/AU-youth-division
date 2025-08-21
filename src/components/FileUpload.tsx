import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface YouthRecord {
  'First Name': string;
  'Last Name': string;
  Gender: string;
  Nationality: string;
  Age: number;
  Degree: string;
  Qualification: string;
  Email: string;
  Status: string;
}

interface FileUploadProps {
  onDataLoaded: (data: YouthRecord[]) => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setUploadStatus('idle');
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as YouthRecord[];

      // Validate required columns
      const requiredColumns = ['First Name', 'Last Name', 'Gender', 'Nationality', 'Age', 'Degree', 'Qualification', 'Email', 'Status'];
      const hasAllColumns = requiredColumns.every(col => 
        jsonData.length > 0 && Object.keys(jsonData[0]).includes(col)
      );

      if (!hasAllColumns) {
        throw new Error('Missing required columns. Please ensure your Excel file contains: First Name, Last Name, Gender, Nationality, Age, Degree, Qualification, Email, Status');
      }

      onDataLoaded(jsonData);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <Card className="p-8 gradient-card shadow-card border-0">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 animate-float">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Upload Youth Data</h2>
        <p className="text-muted-foreground">
          Upload an Excel file (.xlsx, .xls) or CSV file with youth records
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/5 shadow-hover"
            : "border-border hover:border-primary/50 hover:bg-primary/5",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
          ) : uploadStatus === 'success' ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}

          {isLoading ? (
            <p className="text-foreground font-medium">Processing {fileName}...</p>
          ) : uploadStatus === 'success' ? (
            <div>
              <p className="text-green-600 font-medium mb-1">✓ File uploaded successfully!</p>
              <p className="text-sm text-muted-foreground">{fileName}</p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div>
              <p className="text-red-600 font-medium mb-1">⚠ Upload failed</p>
              <p className="text-sm text-muted-foreground">Please check your file format and try again</p>
            </div>
          ) : (
            <div>
              <p className="text-foreground font-medium mb-1">
                {isDragActive ? "Drop your file here" : "Drag & drop your Excel file here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .xlsx, .xls, and .csv files
              </p>
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                Browse Files
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          <strong>Required columns:</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          {['First Name', 'Last Name', 'Gender', 'Nationality', 'Age', 'Degree', 'Qualification', 'Email', 'Status'].map((col) => (
            <span key={col} className="px-2 py-1 bg-background rounded text-xs font-medium border">
              {col}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};