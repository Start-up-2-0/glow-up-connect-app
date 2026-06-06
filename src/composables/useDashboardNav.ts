import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { getNavItemsForRole, getNavSearchPlaceholder } from '@/constants/navigation'
import { useUserStore } from '@/stores/user.store'

export function useDashboardNav() {
  const { profile } = storeToRefs(useUserStore())

  const navItems = computed(() => getNavItemsForRole(profile.value?.role))
  const searchPlaceholder = computed(() => getNavSearchPlaceholder(profile.value?.role))

  return { navItems, searchPlaceholder }
}
