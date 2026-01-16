import type { Partner } from "~/types/flights";

interface PartnerListProps {
  partners: Partner[];
}

export function PartnerList({ partners }: PartnerListProps) {
  const sortedPartners = [...partners].sort((a, b) => a.price - b.price);

  return (
    <ul className="space-y-4">
      {sortedPartners.map((partner) => (
        <li
          key={partner.id}
          className="flex items-center rounded-md border p-4 transition-shadow hover:shadow"
        >
          <span className="min-w-32 w-32 text-lg font-medium">
            {partner.name}
          </span>
          <span className="min-w-24 w-24 text-right text-xl font-bold text-blue-600">
            £{partner.price}
          </span>
          <div className="flex-1" />
          <a
            href={partner.url}
            className="ml-4 whitespace-nowrap rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Book
          </a>
        </li>
      ))}
    </ul>
  );
}
