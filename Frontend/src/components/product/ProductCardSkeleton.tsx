export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col border border-stone-200 bg-white rounded-lg overflow-hidden animate-pulse">
      {/* Thumbnail placeholder */}
      <div className="aspect-square bg-stone-200" />

      {/* Content placeholder */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* Title lines */}
        <div className="h-3.5 bg-stone-200 rounded w-full" />
        <div className="h-3.5 bg-stone-200 rounded w-2/3" />

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-4 bg-stone-200 rounded w-20" />
          <div className="h-3 bg-stone-100 rounded w-12" />
        </div>

        {/* Rating and sold */}
        <div className="flex justify-between items-center mt-1">
          <div className="h-3 bg-stone-100 rounded w-16" />
          <div className="h-3 bg-stone-100 rounded w-14" />
        </div>

        {/* Button */}
        <div className="h-8 bg-stone-200 rounded-md w-full mt-2" />
      </div>
    </div>
  );
}
