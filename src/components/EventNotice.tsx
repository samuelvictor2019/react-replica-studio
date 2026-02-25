import noticeImg from "@/assets/event-notice.png";

const EventNotice = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div>
            <h3 className="font-heading text-3xl md:text-4xl font-medium text-black">Event notice</h3>
            <p className="text-sm text-black/70 mt-4 max-w-md">Some events require registration or prior confirmation before attendance.</p>
          </div>

          <div>
            <div className="overflow-hidden rounded-[18px]">
              <img src={noticeImg} alt="Event notice" className="w-full h-40 md:h-48 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventNotice;
