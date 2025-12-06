import { use } from 'react';
import BookingCheckClient from "../../../components/BookingCheckClient";

export default function Page({ params }) {
  const { id } = use(params);

  const bookingId = Number(id);


  return (
   <BookingCheckClient id={Number(bookingId)} />
  );
}