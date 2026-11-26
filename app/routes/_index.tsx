import { Link } from "react-router";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center dark:bg-gray-900">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-yellow-primary drop-shadow-md">
                  Scrabble Scorer
                </span>
              </h1>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <>
                    <Link
                      to="/games"
                      className="border-transparent mr-4 flex items-center justify-center rounded-md border bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
                    >
                      View Games for {user.email}
                    </Link>
                  </>
                ) : (
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    <Link
                      to="/join"
                      className="border-transparent flex items-center justify-center rounded-md border bg-white px-4 py-3 text-base font-medium text-yellow-primary shadow-sm hover:bg-yellow-secondary sm:px-8 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-yellow-primary px-4 py-3 font-medium text-white hover:bg-yellow-secondary hover:text-yellow-primary dark:bg-yellow-600 dark:hover:bg-yellow-500"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
