export function Logo({ className = '', size = 36 }) {
  return (
    <img
      src="/brand/logo.png"
      alt="AppGeo logo"
      height={size}
      className={`object-contain ${className}`}
      style={{ height: size, width: 'auto' }}
    />
  )
}
