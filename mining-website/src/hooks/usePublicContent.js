import { useEffect, useState } from 'react'

import { apiClient } from '../lib/apiClient'

export function useSettings(fallback) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiClient
      .getSettings()
      .then((res) => {
        if (cancelled) return
        // res: { site, about, nav, quickStats, solutions, services, projects }
        setData(res)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export function useTeam(fallbackTeam) {
  const [data, setData] = useState({ team: fallbackTeam })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiClient
      .getTeam()
      .then((res) => {
        if (cancelled) return
        setData(res)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

export function useGallery(fallbackGallerySections) {
  const [data, setData] = useState({ gallery: fallbackGallerySections })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiClient
      .getGallery()
      .then((res) => {
        if (cancelled) return
        setData(res)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}

