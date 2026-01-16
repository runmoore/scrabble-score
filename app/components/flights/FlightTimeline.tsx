import type { Flight } from "~/types/flights";
import { formatStops } from "~/utils/flights";

interface FlightTimelineProps {
  flight: Flight;
  direction: "outbound" | "return";
  origin: string;
  destination: string;
}

export function FlightTimeline({
  flight,
  direction,
  origin,
  destination,
}: FlightTimelineProps) {
  const isReturn = direction === "return";
  const times = isReturn ? flight.return : flight.outbound;
  const departAirport = isReturn ? destination : origin;
  const arriveAirport = isReturn ? origin : destination;

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">
          {times.departTime}
        </div>
        <div className="text-sm uppercase text-gray-600">{departAirport}</div>
      </div>

      <div className="flex min-w-[80px] flex-col items-center text-gray-400">
        <div className="mb-1 text-xs">{flight.duration}</div>
        <div className="relative flex w-full items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="mx-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={isReturn ? "rotate-180" : ""}
            >
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <div className="mt-1 text-xs">{formatStops(flight.stops)}</div>
      </div>

      <div className="text-left">
        <div className="text-lg font-bold text-gray-900">
          {times.arriveTime}
        </div>
        <div className="text-sm uppercase text-gray-600">{arriveAirport}</div>
      </div>
    </div>
  );
}
