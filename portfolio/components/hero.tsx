export function Hero() {
  return (
    <div className="min-h-screen flex items-center bg-background">
      <div className="container relative z-10 px-4 pt-20">
        <div className="flex flex-col gap-8 max-w-4xl">
          <div className="flex items-start gap-1">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              LUQMAN
              <br />
              ISMAT
            </h1>
            <span className="text-sm mt-2">©</span>
          </div>
          <p className="text-muted-foreground">(Based in Houston, TX)</p>
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-5xl font-bold">Engineering for the [Future]</h2>
          </div>
        </div>
      </div>
    </div>
  )
}

