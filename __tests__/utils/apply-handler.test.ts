// Test the removeMarkerSection function directly without importing inquirer
function removeMarkerSection(content: string, markerStart: string, markerEnd: string): string {
  const startIndex = content.indexOf(markerStart);
  const endIndex = content.indexOf(markerEnd, startIndex + markerStart.length);

  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex).trim();
    const after = content.substring(endIndex + markerEnd.length).trim();

    if (before && after) {
      return before + '\n\n' + after;
    } else if (before) {
      return before;
    } else if (after) {
      return after;
    } else {
      return '';
    }
  }

  return content;
}

describe('Apply Handler - Marker Utilities', () => {
  it('should remove marker sections correctly', () => {
    const content = `Some content before
<!-- TEST-RULES-START -->
Test prompt content
<!-- TEST-RULES-END -->
Some content after`;

    const result = removeMarkerSection(
      content,
      '<!-- TEST-RULES-START -->',
      '<!-- TEST-RULES-END -->'
    );

    expect(result).toBe('Some content before\n\nSome content after');
  });

  it('should handle markers at start of content', () => {
    const content = `<!-- TEST-RULES-START -->
Test content
<!-- TEST-RULES-END -->
More content`;

    const result = removeMarkerSection(
      content,
      '<!-- TEST-RULES-START -->',
      '<!-- TEST-RULES-END -->'
    );

    expect(result).toBe('More content');
  });

  it('should handle markers at end of content', () => {
    const content = `Content before
<!-- TEST-RULES-START -->
Test content
<!-- TEST-RULES-END -->`;

    const result = removeMarkerSection(
      content,
      '<!-- TEST-RULES-START -->',
      '<!-- TEST-RULES-END -->'
    );

    expect(result).toBe('Content before');
  });

  it('should return original content if markers not found', () => {
    const content = 'Content without markers';

    const result = removeMarkerSection(
      content,
      '<!-- TEST-RULES-START -->',
      '<!-- TEST-RULES-END -->'
    );

    expect(result).toBe(content);
  });
});
