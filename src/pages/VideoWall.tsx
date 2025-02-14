
import { useParams } from "react-router-dom";

const VideoWall = () => {
  const { organizationId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-white">
        Organization ID: {organizationId}
      </h1>
    </div>
  );
};

export default VideoWall;
