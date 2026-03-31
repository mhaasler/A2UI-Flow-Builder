import React from 'react';

export const Table: React.FC<any> = ({ columns = [], data = [], className = '' }) => {
  return (
    <div className={`overflow-x-auto border border-slate-200 rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col: any, idx: number) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {data.map((row: any, rowIdx: number) => (
            <tr key={rowIdx}>
              {columns.map((col: any, colIdx: number) => (
                <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TagList: React.FC<any> = ({ tags = [], className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag: string, idx: number) => (
        <span
          key={idx}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};
