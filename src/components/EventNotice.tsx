import noticeImg from "@/assets/event-notice.png";

const EventNotice = () => {
  return (
    <section className="py-20 bg-background">
      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 px-4 md:pl-[max(2rem,calc((100vw-64rem)/2+2rem))] md:pr-10">
          <h3 className="font-heading text-3xl md:text-4xl font-medium text-foreground">Event notice</h3>
          <p className="text-sm text-muted-foreground mt-4 max-w-md">Some events require registration or prior confirmation before attendance.</p>
        </div>

        <div className="md:w-[45%] overflow-hidden rounded-l-[18px] mt-8 md:mt-0">
          <img src={noticeImg} alt="Event notice" className="w-full h-40 md:h-48 object-cover" />
        </div>
      </div>
    </section>
  );
};

export default EventNotice;
