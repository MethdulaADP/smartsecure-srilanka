# Multi-language Support Documentation

## Overview
SmartSecure Sri Lanka supports three languages:
- **English** (en) - Default language
- **Sinhala** (සිංහල) (si) - Primary local language
- **Tamil** (தமிழ்) (ta) - Secondary local language

## Implementation

### Technology Stack
- **i18next** - Main internationalization framework
- **react-i18next** - React integration for i18next
- **i18next-browser-languagedetector** - Automatic language detection

### File Structure
```
frontend/src/i18n/
├── index.js           # i18n configuration
└── locales/
    ├── en.json        # English translations
    ├── si.json        # Sinhala translations
    └── ta.json        # Tamil translations
```

### Language Switcher Component
Located at `frontend/src/components/LanguageSwitcher.jsx`

Features:
- Dropdown interface with flags and language names
- Persistent language selection (localStorage)
- Responsive design (works in mobile menu)
- Visual feedback for current language

### Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <p>{t('home.hero.subtitle')}</p>
    </div>
  );
}
```

### Language Detection
The system automatically detects language based on:
1. **localStorage** - Previously selected language
2. **navigator** - Browser language settings
3. **htmlTag** - HTML lang attribute
4. **fallback** - English if none match

### Translation Keys Structure

```json
{
  "nav": {
    "home": "Home",
    "services": "Services"
  },
  "home": {
    "hero": {
      "title": "Protect What",
      "subtitle": "Advanced Security Solutions"
    }
  }
}
```

## Language-Specific Features

### Sinhala (සිංහල)
- Unicode support for Sinhala script
- Right-to-left text alignment where needed
- Cultural context in translations
- Local terminology for security concepts

### Tamil (தமிழ்)
- Unicode support for Tamil script
- Cultural adaptation for Sri Lankan Tamil community
- Technical terms translated appropriately
- Regional context consideration

## Adding New Languages

1. **Create translation file**: `frontend/src/i18n/locales/{code}.json`
2. **Update language list**: Add to `languages` array in `LanguageSwitcher.jsx`
3. **Import in i18n config**: Add to `resources` in `frontend/src/i18n/index.js`
4. **Test thoroughly**: Verify all UI elements translate correctly

## Best Practices

### Translation Keys
- Use nested structure for organization
- Keep keys descriptive and hierarchical
- Use consistent naming conventions
- Group related translations together

### Component Usage
- Extract all user-facing text to translation keys
- Use interpolation for dynamic content: `t('welcome', { name })`
- Handle pluralization properly
- Test with longest expected text (usually German, but Sinhala can be long)

### Quality Assurance
- Native speaker review for Sinhala and Tamil
- Context verification (technical vs casual tone)
- UI layout testing with different text lengths
- Cultural sensitivity review

## Current Translation Coverage

### ✅ Fully Translated
- Navigation menu
- Home page (hero, services, features, CTA)
- Authentication pages (login, register)
- Footer
- Common UI elements

### 🔄 Partially Translated
- Dashboard (basic structure done)
- About page (structure ready)
- Contact page (form and info)
- Services page

### ❌ Not Yet Translated
- Error messages (using default/English)
- Complex dashboard features
- Admin interfaces (if any)

## Future Enhancements

### Phase 2
- **Right-to-left (RTL) support** for languages that need it
- **Date/time localization** (Sri Lankan formats)
- **Number formatting** (local conventions)
- **Currency display** (LKR formatting)

### Phase 3
- **Voice interface** in local languages
- **Content translation** for user-generated content
- **Regional dialects** support
- **Accessibility** improvements for screen readers in local languages

## Testing Multi-language

### Manual Testing
1. Switch between all three languages
2. Verify text displays correctly
3. Check layout doesn't break with longer text
4. Test mobile responsiveness
5. Verify language persists on page refresh

### Automated Testing
```javascript
// Example test
test('language switcher changes interface language', () => {
  render(<App />);
  // Switch to Sinhala
  fireEvent.click(screen.getByText('සිංහල'));
  expect(screen.getByText('මුල් පිටුව')).toBeInTheDocument();
});
```

## Maintenance

### Regular Tasks
- Review translations for accuracy
- Update new features with all three languages
- Monitor for missing translation keys
- Test with different text lengths

### Community Contribution
- Native speakers can contribute translations
- Cultural context review by locals
- Feedback collection from Sri Lankan users
- Continuous improvement based on usage

---

**Note**: This implementation provides a solid foundation for Sri Lankan users while maintaining international accessibility through English support.