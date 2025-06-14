import React, { useState } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  ArrowRight, 
  FileText,
  Image
} from 'lucide-react';
import { migrateContentReferences } from '../../utils/contentHelpers';

const ContentMigrationTool = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    [key: string]: {
      success: boolean;
      processed: number;
      updated: number;
      errors: number;
    }
  }>({});
  const [showResults, setShowResults] = useState(false);

  // Define tables and columns to migrate
  const migrations = [
    { table: 'testimonials', urlColumn: 'image_url', label: 'Testimonial Images' },
    { table: 'client_media', urlColumn: 'media_url', label: 'Client Media' },
    { table: 'yachts', urlColumn: 'image_url', label: 'Yacht Images' },
  ];

  const runMigration = async () => {
    setLoading(true);
    setShowResults(true);
    const newResults: typeof results = {};

    try {
      for (const migration of migrations) {
        const result = await migrateContentReferences(
          migration.table,
          migration.urlColumn
        );
        
        newResults[migration.table] = result;
      }
      
      setResults(newResults);
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const stats = {
      processed: 0,
      updated: 0,
      errors: 0
    };
    
    Object.values(results).forEach(result => {
      stats.processed += result.processed;
      stats.updated += result.updated;
      stats.errors += result.errors;
    });
    
    return stats;
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-start space-x-4 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Migration Tool</h3>
          <p className="text-gray-600">
            This tool will migrate existing content references to use the new Supabase Storage system.
            It will scan database tables for image URLs and link them to the corresponding storage items.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Before You Begin</h4>
            <p className="text-blue-800 text-sm">
              Make sure you have already uploaded your content to the Supabase Storage bucket.
              This tool will only link existing content, not upload new files.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h4 className="font-semibold text-gray-900">Tables to Migrate</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {migrations.map((migration) => (
            <div key={migration.table} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{migration.label}</p>
                    <p className="text-sm text-gray-600">Table: {migration.table}</p>
                  </div>
                </div>
                {results[migration.table] && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    results[migration.table].success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {results[migration.table].success ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>
                      {results[migration.table].updated}/{results[migration.table].processed}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showResults && Object.keys(results).length > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${
          getTotalStats().errors === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <h4 className="font-semibold text-gray-900 mb-2">Migration Results</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="text-xl font-bold text-gray-900">{getTotalStats().processed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated</p>
              <p className="text-xl font-bold text-green-600">{getTotalStats().updated}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-xl font-bold text-red-600">{getTotalStats().errors}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={runMigration}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Migrating...</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              <span>Run Migration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContentMigrationTool;