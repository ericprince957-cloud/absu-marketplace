export interface ActionState {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export const initialState: ActionState = {};

export function fail(error: string, fieldErrors?: ActionState["fieldErrors"]): ActionState {
  return { ok: false, error, fieldErrors };
}

export function success(message?: string): ActionState {
  return { ok: true, message };
}
