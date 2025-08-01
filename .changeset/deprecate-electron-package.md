---
"@audiowave/electron": patch
---

# Deprecate @audiowave/electron package

## ⚠️ DEPRECATION NOTICE

The `@audiowave/electron` package is now **deprecated** and will no longer receive updates. 

## 🔄 Migration Path

**Please migrate to the new approach:**

- **Use `@audiowave/react` with `useCustomAudio`** instead of `useIPCAudio`
- **Create custom providers** for Electron IPC communication
- **Follow the updated Electron example** for implementation guidance

## 📦 What to use instead

- **For Electron apps**: `@audiowave/react` with `useCustomAudio` and custom provider
- **For web apps**: `@audiowave/react` with `useMediaAudio`
- **For custom integrations**: Implement providers using `@audiowave/core`

## 📚 Migration Resources

- See the [Electron example](../../examples/electron) for new implementation
- Check [@audiowave/react documentation](../react/README.md) for `useCustomAudio`
- Review [@audiowave/core documentation](../core/README.md) for custom providers

## 🗓 Timeline

- **Current**: Package marked as deprecated
- **Future**: Package will be unpublished after sufficient migration period
- **Recommendation**: Migrate immediately to avoid future issues
