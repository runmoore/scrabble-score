import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { flights } from "~/data/flights-data";
import { FlightDetails, PartnerList } from "~/components/flights";

export async function loader({ params }: LoaderFunctionArgs) {
  const { itineraryId } = params;
  const flight = flights.find((f) => String(f.id) === String(itineraryId));
  if (!flight) {
    throw new Response("Itinerary not found", { status: 404 });
  }
  return json({ flight, params });
}

export default function PartnerSelectionPage() {
  const { flight, params } = useLoaderData<typeof loader>();
  const { origin, destination, itineraryId, departDate, returnDate } = params;
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-blue-600">Choose a Partner</h2>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-2xl font-light text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          onClick={() =>
            navigate(
              `/flights/${origin}/${destination}/${departDate}/${returnDate}`
            )
          }
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <FlightDetails flight={flight} variant="detailed" showDates={true} />

        <p className="my-4 text-sm text-gray-700">
          Select a partner to book your flight from{" "}
          <span className="font-semibold">{origin?.toUpperCase()}</span> to{" "}
          <span className="font-semibold">{destination?.toUpperCase()}</span>.
        </p>

        <PartnerList partners={flight.partners} />

        <p className="mt-6 text-xs text-gray-400">
          Itinerary ID: <span className="font-mono">{itineraryId}</span>
        </p>
      </div>
    </div>
  );
}
