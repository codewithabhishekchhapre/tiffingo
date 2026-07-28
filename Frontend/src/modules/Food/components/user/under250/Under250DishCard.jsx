import { motion } from "framer-motion"
import OptimizedImage from "@food/components/OptimizedImage"
import { VegMark, resolveFoodType, AddButton } from "@food/components/user/swiggy"

const RUPEE_SYMBOL = "\u20B9"

export default function Under250DishCard({
  item,
  itemIndex,
  quantity,
  disabled,
  onItemClick,
  onAdd,
  onIncrement,
  onDecrement,
}) {
  return (
    <motion.div
      className="w-full min-w-0 group cursor-pointer"
      onClick={() => onItemClick(item)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: itemIndex * 0.04 }}
    >
      <div className="relative w-full min-w-0 rounded-2xl overflow-hidden border border-gray-100/90 dark:border-gray-800/50 bg-(--sw-surface) backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_16px_40px_-16px_rgba(255,106,0,0.2)] group-hover:border-primary/30 md:group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden bg-(--sw-surface-alt)">
          <OptimizedImage
            src={item.image}
            alt={item.name}
            className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-108"
            objectFit="cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            priority={itemIndex < 4}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Price badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/55 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[11px] font-extrabold ring-1 ring-white/10">
            {RUPEE_SYMBOL}{Math.round(item.price)}
          </div>

          {/* Veg indicator */}
          <VegMark
            type={resolveFoodType(item)}
            size="lg"
            className="absolute top-2.5 left-2.5"
          />

          {/* Add / qty control */}
          <div
            className="absolute bottom-2.5 right-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <AddButton
              size="sm"
              quantity={quantity}
              disabled={disabled}
              onAdd={(e) => (quantity > 0 ? onIncrement(item, e) : onAdd(item, e))}
              onRemove={(e) => onDecrement(item, e)}
            />
          </div>
        </div>

        {/* Details */}
        <div className="p-3">
          <div className="flex items-start gap-1.5 mb-1">
            <VegMark type={resolveFoodType(item)} size="sm" className="mt-0.5" />
            <h4 className="text-[13px] font-bold text-(--sw-text) line-clamp-2 leading-snug group-hover:text-primary transition-colors">
              {item.name}
            </h4>
          </div>
          {item.bestPrice && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Best price
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
