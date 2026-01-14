# API Contracts

**Feature**: Cryptogram Mapping Table Visual Redesign

## Summary

No API contracts required. This is a client-side UI redesign that does not involve:

- New API endpoints
- Modified API endpoints
- Data fetching
- Server-side changes

The cryptogram page operates entirely client-side with React state management. All functionality remains unchanged.

## Component Interface (Unchanged)

The only "contract" is the component props interface, which remains identical:

```typescript
interface MappingGridProps {
  mappings: Record<string, string>; // Cipher → plain letter mappings
  onMappingChange: (cipher: string, plain: string) => void; // Callback for mapping updates
  onClearAll: () => void; // Callback to clear all mappings
  disabled: boolean; // Disable inputs when over character limit
}
```

This interface is internal to the React component and does not change with the visual redesign.
