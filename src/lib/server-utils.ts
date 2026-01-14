import { auth } from "@/lib/auth";
import { z } from "zod";

export type ActionState<T> = {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

/**
 * Creates a safe server action that handles validation and errors
 */
export function createSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    action: (validatedData: TInput, userId: string) => Promise<TOutput>
) {
    return async (input: TInput): Promise<ActionState<TOutput>> => {
        try {
            const session = await auth();
            if (!session?.user?.id) {
                return { success: false, error: "Unauthorized" };
            }

            const validatedResult = schema.safeParse(input);

            if (!validatedResult.success) {
                return {
                    success: false,
                    error: "Validation failed",
                    fieldErrors: validatedResult.error.flatten().fieldErrors,
                };
            }

            const data = await action(validatedResult.data, session.user.id);

            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error("Server Action Error:", error);

            // Handle specific known error types if needed
            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: false,
                error: "Something went wrong. Please try again later.",
            };
        }
    };
}

/**
 * Creates a safe server action without authentication requirement
 */
export function createPublicSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    action: (validatedData: TInput) => Promise<TOutput>
) {
    return async (input: TInput): Promise<ActionState<TOutput>> => {
        try {
            const validatedResult = schema.safeParse(input);

            if (!validatedResult.success) {
                return {
                    success: false,
                    error: "Validation failed",
                    fieldErrors: validatedResult.error.flatten().fieldErrors,
                };
            }

            const data = await action(validatedResult.data);

            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error("Server Action Error:", error);

            if (error instanceof Error) {
                return {
                    success: false,
                    error: error.message,
                };
            }

            return {
                success: false,
                error: "Something went wrong. Please try again later.",
            };
        }
    };
}
