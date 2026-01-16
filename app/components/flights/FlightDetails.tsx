import type { Flight } from "~/types/flights";
import { formatDate, formatStops } from "~/utils/flights";

interface FlightDetailsProps {
  flight: Flight;
  variant?: "compact" | "detailed";
  showDates?: boolean;
}

export function FlightDetails({
  flight,
  variant = "compact",
  showDates = false,
}: FlightDetailsProps) {
  if (variant === "detailed") {
    return (
      <div className="rounded border border-blue-100 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-4">
          <span className="text-lg font-bold text-blue-600">
            {flight.airline}
          </span>
          <span className="text-gray-700">{flight.flightNumber}</span>
        </div>

        {/* Outbound flight details */}
        <div className="mb-3">
          <div className="mb-1 text-sm text-gray-600">
            Outbound{showDates && ` • ${formatDate(flight.departDate)}`}
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="font-semibold">{flight.outbound.departTime}</span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold">{flight.outbound.arriveTime}</span>
            <span className="text-gray-600">
              ({flight.origin} → {flight.destination})
            </span>
          </div>
        </div>

        {/* Return flight details */}
        <div className="mb-3">
          <div className="mb-1 text-sm text-gray-600">
            Return{showDates && ` • ${formatDate(flight.returnDate)}`}
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="font-semibold">{flight.return.departTime}</span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold">{flight.return.arriveTime}</span>
            <span className="text-gray-600">
              ({flight.destination} → {flight.origin})
            </span>
          </div>
        </div>

        <div className="mb-1 text-gray-700">
          Duration: {flight.duration}, Stops: {formatStops(flight.stops)}
        </div>
        <div className="font-bold text-blue-600">
          Base Price: £{flight.price}
        </div>
      </div>
    );
  }

  // Compact variant for search results
  return (
    <div className="text-sm text-gray-600">
      {flight.airline} • {flight.flightNumber}
    </div>
  );
}
