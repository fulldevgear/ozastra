import { describe, expect, it } from 'vitest'

import { allowsPrivacyAnalytics } from './PrivacyAnalytics'

describe('privacy analytics', () => {
  it('does not collect when Do Not Track is enabled', () => {
    expect(
      allowsPrivacyAnalytics({
        doNotTrack: '1',
        globalPrivacyControl: false,
      }),
    ).toBe(false)
  })

  it('does not collect when Global Privacy Control is enabled', () => {
    expect(
      allowsPrivacyAnalytics({
        doNotTrack: '0',
        globalPrivacyControl: true,
      }),
    ).toBe(false)
  })

  it('allows an anonymous page view without a privacy signal', () => {
    expect(
      allowsPrivacyAnalytics({
        doNotTrack: null,
        globalPrivacyControl: false,
      }),
    ).toBe(true)
  })
})
