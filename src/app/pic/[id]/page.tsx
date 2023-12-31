import { getXataClient } from "@/lib/xata"
import { Completion } from "@/components/completion"

const getPic = async (id: string) => {
  const xata = getXataClient()
  const pic = await xata.db.pic.read(`rec_${id}`)

  return pic
}

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id
  const pic = await getPic(id)

  if (!pic) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-black">404</h1>
        <p className="">Pic not found</p>
      </div>
    )
  }

  return (
    <div className="">
      <h1 className="font-display bg-gradient-to-br from-primary-foreground/50 via-primary-foreground  to-primary-foreground/50 bg-clip-text text-center text-3xl font-bold tracking-[-0.02em] text-transparent drop-shadow-sm md:text-5xl md:leading-[5rem]">
        Your tweet
      </h1>
      <Completion
        url={pic?.url || ""}
        caption={pic?.caption || ""}
        aspect_ratio={pic.aspect_ratio || 1 / 1}
      />
    </div>
  )
}

export default Page
