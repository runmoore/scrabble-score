import type { SearchParams } from "~/types/flights";
import { formatDate } from "~/utils/flights";

type SearchHeaderProps = SearchParams;

export function SearchHeader({
  origin,
  destination,
  departDate,
  returnDate,
}: SearchHeaderProps) {
  return (
    <>
      <h1 className="mt-8 mb-4 text-3xl font-bold">Flights Results</h1>
      <div className="mb-6 space-y-1">
        <p>
          <span className="font-semibold text-blue-600">Origin:</span> {origin}
        </p>
        <p>
          <span className="font-semibold text-blue-600">Destination:</span>{" "}
          {destination}
        </p>
        <p>
          <span className="font-semibold text-blue-600">Departure Date:</span>{" "}
          {formatDate(departDate)}
        </p>
        <p>
          <span className="font-semibold text-blue-600">Return Date:</span>{" "}
          {formatDate(returnDate)}
        </p>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-blue-600">
        Available Flights
      </h2>
    </>
  );
}
