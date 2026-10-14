import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Maelezo ya Oda</h1>
      <p className="mt-2">Namba ya oda: {id}</p>
    </main>
  );
}
