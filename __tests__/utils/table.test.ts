import { formatTable, TableColumn } from '../../src/utils/table';

describe('Table Utils', () => {
  it('should format table correctly', () => {
    const columns: TableColumn[] = [
      { key: 'name', header: 'Name', width: 10 },
      { key: 'value', header: 'Value', width: 8 },
    ];
    const data = [
      { name: 'test', value: '123' },
      { name: 'longer', value: '456' },
    ];

    const result = formatTable({ columns, data });
    expect(result).toContain('Name');
    expect(result).toContain('Value');
    expect(result).toContain('test');
    expect(result).toContain('123');
  });

  it('should return empty string for no data', () => {
    const columns: TableColumn[] = [{ key: 'name', header: 'Name' }];
    const data: Record<string, unknown>[] = [];

    expect(formatTable({ columns, data })).toBe('');
  });
});
