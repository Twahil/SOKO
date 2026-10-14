import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Maelezo ya Bidhaa</h1>
      <p className="mt-2">Namba ya bidhaa: {id}</p>
    </main>
  );
}
