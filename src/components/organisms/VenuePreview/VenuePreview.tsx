import React, { useMemo } from "react";

// Components
import JazzBar from "components/templates/Jazzbar";

// Typings
import { createJazzbar } from "types/JazzbarVenue";
import { VenueTemplate } from "types/VenueTemplate";
import { FormValues } from "pages/Admin/Details/Details.types";

interface PropsType {
  values: FormValues;
}

const VenuePreview: React.FunctionComponent<PropsType> = ({ values }) => {
  const venue = useMemo(() => createJazzbar(values), [values]);

  let venueComponent;
  switch (venue.template) {
    case VenueTemplate.jazzbar:
      venueComponent = <JazzBar venue={venue} />;
      break;
    // case VenueTemplate.friendship:
    //   return <>Friendship Page not supported</>;
    // case VenueTemplate.partymap:
    //   venueComponent = <PartyMap venue={venue} />;
    //   break;
    // case VenueTemplate.artpiece:
    //   venueComponent = <ArtPiece venue={venue} />;
    //   break;
    default:
      return (
        <>
          Invalid venue {venue}: unknown template {venue.template}
        </>
      );
  }

  return <div className="venue-preview">{venueComponent}</div>;
};

export default VenuePreview;
