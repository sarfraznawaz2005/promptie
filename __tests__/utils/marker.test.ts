import {
  getMarkerStart,
  getMarkerEnd,
  getFormattedMarkerStart,
  getFormattedMarkerEnd,
} from '../../src/utils/marker';

describe('Marker Utils', () => {
  it('should generate correct marker start', () => {
    expect(getMarkerStart('USER')).toBe('USER-RULES-START');
    expect(getMarkerStart('TEST')).toBe('TEST-RULES-START');
  });

  it('should generate correct marker end', () => {
    expect(getMarkerEnd('USER')).toBe('USER-RULES-END');
    expect(getMarkerEnd('TEST')).toBe('TEST-RULES-END');
  });

  it('should generate formatted marker start', () => {
    expect(getFormattedMarkerStart('USER')).toBe('<!-- USER-RULES-START -->');
  });

  it('should generate formatted marker end', () => {
    expect(getFormattedMarkerEnd('USER')).toBe('<!-- USER-RULES-END -->');
  });
});
