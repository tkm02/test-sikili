export class OdooAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OdooAuthError'
  }
}

export class OdooRpcError extends Error {
  constructor(
    message: string,
    public readonly model?: string,
    public readonly method?: string,
  ) {
    super(message)
    this.name = 'OdooRpcError'
  }
}

export function extractOdooErrorMessage(err: unknown): string {
  if (err instanceof OdooAuthError || err instanceof OdooRpcError) {
    return err.message
  }
  if (err instanceof Error) {
    // Odoo XML-RPC errors arrive as structured objects inside the message
    const match = err.message.match(/"message":\s*"([^"]+)"/)
    if (match) return match[1]
    return err.message
  }
  return 'Erreur inconnue lors de la synchronisation Odoo'
}
