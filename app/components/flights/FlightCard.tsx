import { useState } from "react";
import type { Flight } from "~/types/flights";
import { FlightTimeline } from "./FlightTimeline";

interface FlightCardProps {
  flight: Flight;
  minPrice: number;
  onSelect: (flightId: number, wasHovered?: boolean) => void;
  origin: string;
  destination: string;
  selected?: boolean;
}

export function FlightCard({
  flight,
  minPrice,
  onSelect,
  origin,
  destination,
  selected = false,
}: FlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <button
        onClick={() => onSelect(flight.id, isHovered)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`block w-full rounded-lg border bg-white p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          selected
            ? "border-blue-600 shadow-lg ring-2 ring-blue-600 ring-opacity-50"
            : "border-gray-200 hover:border-blue-600 hover:shadow-lg focus:border-blue-600"
        }`}
        aria-label={`View partners for ${flight.airline} ${flight.flightNumber}`}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Flight timing and details */}
          <div className="flex-1">
            {/* Outbound flight */}
            <div className="mb-2 flex items-center gap-6">
              <FlightTimeline
                flight={flight}
                direction="outbound"
                origin={origin}
                destination={destination}
              />
            </div>

            {/* Return flight */}
            <div className="mb-2 flex items-center gap-6">
              <FlightTimeline
                flight={flight}
                direction="return"
                origin={origin}
                destination={destination}
              />
            </div>

            {/* Airline info */}
            <div className="text-sm text-gray-600">
              {flight.airline} • {flight.flightNumber}
            </div>
          </div>

          {/* Right side - Price and action */}
          <div className="ml-6 text-right">
            <div className="mb-1 text-2xl font-bold text-blue-600">
              £{minPrice}
            </div>
            <div className="mb-3 text-sm text-gray-600">per person</div>
            <div className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
              Select
            </div>
          </div>
        </div>
      </button>

      {/* Hover Peek - appears when hovering over the card */}
      {isHovered && (
        <div
          className="hover-peek pointer-events-none fixed top-0 right-0 z-30 h-full border-l border-gray-300 bg-gray-50 shadow-xl"
          style={{
            width: "max(100px, min(20vw, 200px))",
          }}
        >
          {/* Empty peek - just an indicator that clicking will open something */}
        </div>
      )}
    </>
  );
}
