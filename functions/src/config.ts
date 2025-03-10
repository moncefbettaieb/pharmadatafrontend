import * as functions from 'firebase-functions'

interface Config {
  frontend: {
    url: string
  }
}

export function getConfig(): Config {
  const config = functions.config() as Config
  
  if (!config.frontend?.url) {
    throw new Error('Configuration frontend.url manquante')
  }

  return config
}