"use client"

import { createContext, useContext } from "react"
import { DEFAULT_PROFILE, type Profile } from "@/lib/profile-schema"

const ProfileContext = createContext<Profile>(DEFAULT_PROFILE)

export function ProfileProvider({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  return useContext(ProfileContext)
}
