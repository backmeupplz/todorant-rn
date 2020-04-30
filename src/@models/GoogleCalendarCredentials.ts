import { persist } from 'mobx-persist'

export class GoogleCalendarCredentials {
  @persist refresh_token?: string | null
  @persist expiry_date?: number | null
  @persist access_token?: string | null
  @persist token_type?: string | null
  @persist id_token?: string | null
}
