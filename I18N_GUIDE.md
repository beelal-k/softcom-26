# Multilingual Setup (English & Urdu) 🌐

## ✅ Features Added

- 🇬🇧 English (default)
- 🇵🇰 اردو Urdu
- 🔄 Language switcher component
- 💾 Language preference saved in cookies
- 🎨 Clean translation files

## 📁 Structure

```
messages/
  ├── en.json  # English translations
  └── ur.json  # Urdu translations

src/
  ├── i18n/
  │   └── config.ts  # i18n configuration
  └── components/
      └── language-switcher.tsx  # Language toggle component
```

## 🚀 Usage

### 1. Add Language Switcher to Layout/Navbar

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Navbar() {
  return (
    <nav>
      {/* ... other nav items ... */}
      <LanguageSwitcher />
    </nav>
  );
}
```

### 2. Use Translations in Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('login')}</button>
    </div>
  );
}
```

### 3. Use in Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('common');

  return <h1>{t('welcome')}</h1>;
}
```

## 📝 Translation Keys

### Common
- `common.welcome`, `common.login`, `common.register`
- `common.dashboard`, `common.organizations`, `common.teams`
- `common.save`, `common.cancel`, `common.delete`, `common.edit`

### Auth
- `auth.signIn`, `auth.signUp`
- `auth.email`, `auth.password`, `auth.username`
- `auth.loginSuccess`, `auth.registerSuccess`

### Organization
- `organization.createOrganization`
- `organization.organizationName`, `organization.description`
- `organization.myOrganizations`

### Team
- `team.createTeam`, `team.teamName`
- `team.addMember`, `team.removeMember`
- `team.permissions`, `team.role`

### Invitation
- `invitation.sendInvitation`, `invitation.acceptInvitation`
- `invitation.invitationSent`, `invitation.invitationAccepted`
- `invitation.pleaseLogin`, `invitation.processing`

## 🎨 Example: Update Invitation Page

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function AcceptInvitationPage() {
  const t = useTranslations('invitation');

  return (
    <div>
      <h1>{t('processing')}</h1>
      <p>{t('pleaseLogin')}</p>
      <p>{t('redirecting')}</p>
    </div>
  );
}
```

## 🔧 Configuration

The app stores language preference in cookies (`NEXT_LOCALE`). This persists across page reloads and sessions.

**Default Language**: English (`en`)
**Available Languages**: English (`en`), Urdu (`ur`)

## ➕ Adding New Translations

1. Add key to both `messages/en.json` and `messages/ur.json`
2. Use in components with `t('category.key')`

Example:
```json
// en.json
{
  "notification": {
    "newMessage": "You have a new message"
  }
}

// ur.json
{
  "notification": {
    "newMessage": "آپ کو ایک نیا پیغام موصول ہوا"
  }
}
```

Usage:
```tsx
const t = useTranslations('notification');
<p>{t('newMessage')}</p>
```

## 🌐 RTL Support (Urdu)

For proper Urdu text direction, add to your root layout:

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  const locale = cookies().get('NEXT_LOCALE')?.value || 'en';
  
  return (
    <html lang={locale} dir={locale === 'ur' ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

## 🎯 Next Steps

1. Add `<LanguageSwitcher />` to your navbar
2. Replace hardcoded text with `t('key')` in components
3. Test language switching
4. Add more translations as needed

Ready to use! 🚀

