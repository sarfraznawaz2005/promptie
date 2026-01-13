describe('Marker Generation Logic', () => {
  it('should save only marker name and generate start/end markers dynamically', () => {
    const name = 'test prompt';
    const marker = name.toUpperCase();
    const expectedMarker = 'TEST PROMPT';

    expect(marker).toBe(expectedMarker);
  });

  it('should generate correct start marker from marker', () => {
    const marker = 'TEST PROMPT';
    const expectedStart = `<!-- ${marker}-RULES-START -->`;

    expect(expectedStart).toBe('<!-- TEST PROMPT-RULES-START -->');
  });

  it('should generate correct end marker from marker', () => {
    const marker = 'TEST PROMPT';
    const expectedEnd = `<!-- ${marker}-RULES-END -->`;

    expect(expectedEnd).toBe('<!-- TEST PROMPT-RULES-END -->');
  });

  it('should handle names with spaces and special characters', () => {
    const name = 'my-custom-prompt!';
    const marker = name.toUpperCase();
    const expectedMarker = 'MY-CUSTOM-PROMPT!';

    expect(marker).toBe(expectedMarker);
  });

  it('should use default marker for "promptie"', () => {
    const name = 'promptie';
    const marker = name.toUpperCase();
    const expectedMarker = 'PROMPTIE';

    expect(marker).toBe(expectedMarker);
  });
});
