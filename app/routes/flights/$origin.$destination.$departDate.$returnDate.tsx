import { json, type LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  Outlet,
  useLocation,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import { flights } from "~/data/flights-data";
import { SearchHeader, FlightCard, Modal } from "~/components/flights";
import { getMinPrice } from "~/utils/flights";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { origin, destination, departDate, returnDate } = params;
  const results = flights.filter(
    (f) =>
      f.origin.toLowerCase() === origin?.toLowerCase() &&
      f.destination.toLowerCase() === destination?.toLowerCase() &&
      f.departDate === departDate &&
      f.returnDate === returnDate
  );

  // Get modal parameter from URL
  const url = new URL(request.url);
  const isModal = url.searchParams.get("modal") === "true";

  return json({
    origin,
    destination,
    departDate,
    returnDate,
    results,
    isModal,
  });
}

export default function FlightsResultsPage() {
  const { origin, destination, departDate, returnDate, results } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();
  const [wasOpenedFromPeek, setWasOpenedFromPeek] = useState(false);

  // Parse search params from location
  const searchParams = new URLSearchParams(location.search);
  const isModal = searchParams.get("modal") === "true";

  // Check if we're on a config route
  const isConfigModalRoute = location.pathname.includes("/config/modal/");
  const isConfigRoute = location.pathname.includes("/config/");

  const handleModalToggle = (checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set("modal", "true");
    } else {
      newParams.delete("modal");
    }
    const searchParamsString = newParams.toString();
    navigate(
      `/flights/${origin}/${destination}/${departDate}/${returnDate}${
        searchParamsString ? `?${searchParamsString}` : ""
      }`
    );
  };

  // Reset the fromPeek state when modal closes
  useEffect(() => {
    if (!isConfigRoute) {
      setWasOpenedFromPeek(false);
    }
  }, [isConfigRoute]);

  // Get the selected flight ID from the URL
  const selectedFlightId = isConfigModalRoute
    ? parseInt(location.pathname.split("/config/modal/")[1])
    : null;

  const handleFlightSelect = (flightId: number, wasHovered = false) => {
    if (wasHovered) {
      setWasOpenedFromPeek(true);
    }
    const currentSearchParams = searchParams.toString();
    const searchParamsString = currentSearchParams
      ? `?${currentSearchParams}`
      : "";
    if (isModal) {
      navigate(
        `/flights/${origin}/${destination}/${departDate}/${returnDate}/config/modal/${flightId}${searchParamsString}`
      );
    } else {
      navigate(
        `/flights/${origin}/${destination}/${departDate}/${returnDate}/config/${flightId}${searchParamsString}`
      );
    }
  };

  const handleCloseModal = () => {
    const currentSearchParams = searchParams.toString();
    const searchParamsString = currentSearchParams
      ? `?${currentSearchParams}`
      : "";
    navigate(
      `/flights/${origin}/${destination}/${departDate}/${returnDate}${searchParamsString}`
    );
  };

  // If we're on a non-modal config route, render it as a dedicated page
  if (isConfigRoute && !isConfigModalRoute) {
    return (
      <div className="mx-auto mt-10 max-w-2xl">
        <Outlet />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mt-10 max-w-2xl">
        {/* Main content area - search results */}
        <SearchHeader
          origin={origin ?? ""}
          destination={destination ?? ""}
          departDate={departDate ?? ""}
          returnDate={returnDate ?? ""}
        />

        {/* Modal toggle checkbox */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isModal}
              onChange={(e) => handleModalToggle(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
            />
            <span>Open booking panel as a modal?</span>
          </label>
        </div>

        {results.length === 0 ? (
          <p className="text-gray-500">No flights found for your search.</p>
        ) : (
          <ul className="space-y-3">
            {results.map((flight) => {
              const minPrice = flight.partners
                ? getMinPrice(flight.partners)
                : flight.price;
              return (
                <li key={flight.id}>
                  <FlightCard
                    flight={flight}
                    minPrice={minPrice}
                    onSelect={handleFlightSelect}
                    origin={origin ?? ""}
                    destination={destination ?? ""}
                    selected={selectedFlightId === flight.id}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal PSS - Partner Selection Sidebar */}
      <Modal
        isOpen={isConfigModalRoute}
        onClose={handleCloseModal}
        position="right"
        size="md"
        closeOnBackdropClick={true}
        closeOnEscape={true}
        preventBodyScroll={true}
        fromPeek={wasOpenedFromPeek}
      >
        <Outlet />
      </Modal>
    </>
  );
}
