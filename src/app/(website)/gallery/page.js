export const metadata = { title: 'Gallery - AdSky Solution' };

const categories = ['All', 'Office', 'Events', 'Team', 'Projects'];
const galleryItems = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
}));

export default function GalleryPage() {
  return (
    <>
      <section className="relative pt-32 pb-20">
        <div className="glow-dot bg-secondary top-20 left-0 animate-pulse-slow" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
            Our <span className="gradient-text">Gallery</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">Moments captured from our journey</p>
        </div>
      </section>

      <section className="section-padding !pt-0">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold gradient-text opacity-20">
                  {item.id}
                </div>
                <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-primary/80 px-3 py-1.5 rounded-lg">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-text-muted text-sm mt-8">Upload real images from the admin dashboard to fill this gallery.</p>
        </div>
      </section>
    </>
  );
}
