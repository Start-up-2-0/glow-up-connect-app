import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'
import type { EstabelecimentoAcesso, ChangePasswordPayload, UpdateProfilePayload, User, UserSummary } from '@/types/user.types'

export const useUserStore = defineStore('user', () => {
  const profile = ref<User | null>(null)
  const estabelecimentos = ref<EstabelecimentoAcesso[]>([])
  const loading = ref(false)
  const estabelecimentosLoading = ref(false)
  const saving = ref(false)
  const changingPassword = ref(false)

  function setUser(user: User | null) {
    profile.value = user
  }

  function setUserFromSummary(summary: UserSummary) {
    profile.value = {
      id: summary.id,
      nome: summary.nome,
      email: summary.email,
      role: summary.role,
      ativo: true,
      avatarBase64: summary.avatarBase64 ?? null,
    }
  }

  function clear() {
    profile.value = null
    estabelecimentos.value = []
  }

  async function fetchMe(force = false) {
    if (profile.value && !force) return profile.value
    loading.value = true
    try {
      const { data } = await userService.me()
      profile.value = data
      return profile.value
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    saving.value = true
    try {
      await userService.updateMe(payload)
      if (profile.value) {
        profile.value = {
          ...profile.value,
          ...payload,
        }
      }
      await fetchMe(true)
    } finally {
      saving.value = false
    }
  }

  async function fetchEstabelecimentos(force = false) {
    if (estabelecimentos.value.length > 0 && !force) {
      return estabelecimentos.value
    }
    estabelecimentosLoading.value = true
    try {
      const { data } = await userService.meEstabelecimentos()
      estabelecimentos.value = data
      return estabelecimentos.value
    } finally {
      estabelecimentosLoading.value = false
    }
  }

  async function changePassword(payload: ChangePasswordPayload) {
    changingPassword.value = true
    try {
      await userService.alterarSenha(payload)
    } finally {
      changingPassword.value = false
    }
  }

  return {
    profile,
    estabelecimentos,
    loading,
    estabelecimentosLoading,
    saving,
    changingPassword,
    setUser,
    setUserFromSummary,
    clear,
    fetchMe,
    updateProfile,
    changePassword,
    fetchEstabelecimentos,
  }
})
