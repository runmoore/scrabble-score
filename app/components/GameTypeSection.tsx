import { Form } from "@remix-run/react";

export function GameTypeSection({
  gameType,
  gameTypes,
}: {
  gameType: { id: string; name: string } | null;
  gameTypes: { id: string; name: string }[];
}) {
  if (gameType) {
    return (
      <h2 className="mb-2 text-xl font-bold dark:text-gray-100">
        {gameType.name}
      </h2>
    );
  }

  if (gameTypes.length > 0) {
    return (
      <Form method="post" className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium dark:text-gray-300">
            Set game type:
          </span>
          {gameTypes.map((gt) => (
            <button
              key={gt.id}
              type="submit"
              name="gameTypeId"
              value={gt.id}
              className="rounded bg-blue-primary px-3 py-1 text-sm text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              {gt.name}
            </button>
          ))}
        </div>
        <input type="hidden" name="action" value="set-game-type" />
      </Form>
    );
  }

  return null;
}
