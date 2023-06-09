import supabase from '../../../utils/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import ImageUploading, { ImageListType } from 'react-images-uploading';

type Link = {
  title: string;
  url: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userID, setUserID] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [links, setLinks] = useState<Link[]>();
  const [images, setImages] = useState<ImageListType>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const creatorSlug = router.query.creatorSlug;

  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
  }

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user", user); 
      if (user) {
        const userID = user.data.user?.id;
        setIsAuthenticated(true);
        setUserID(userID);
        setIsLoading(false);
        // console.log("authenticated");
      }
      console.log("isAuthenticated: ", isAuthenticated);
    };
    getUser();  // need to call the function
  }, []);

  useEffect(() => {
    const getLinks = async () => {
      try {
        const {data, error} = await supabase.from('links').select("title, url").eq('user_id', userID);
        if (error) throw error;
        console.log("data: ", data);
        setLinks(data);
      }
      catch (error) {
        console.log("error: ", error);
      }
    }
    if (userID) {
      getLinks();
    }
  }, [userID])

  useEffect(() => {
    const getUser = async () => {
      try {
        const {data, error} = await supabase
          .from('users')
          .select("id, profile_picture_url")
          .eq('username', creatorSlug);
        if (error) throw error;
        const profilePictureUrl = data[0]["profile_picture_url"];
        const userId = data[0]["id"];
        setProfilePictureUrl(profilePictureUrl);
        setUserID(userId);
      }
      catch (error) {
        console.log("error: ", error);
      }
    }
    if (creatorSlug ) {
      getUser();
    }
  }, [creatorSlug])

  const addNewLink = async () => {
    try {
      if (title && url && userID) {
        const { data, error } = await supabase.from('links').insert({
          title: title,
          url: url,
          user_id: userID
        }).select();
        if (error) throw error;
        console.log("data: ", data)
        if (links) {
          setLinks([...(data as Link[]), ...links]);
        }        
        // if (links) {
        //   setLinks([...data, ...links]);
        // } 
      }
    }
    catch (error) {
      console.log("error: ", error)
    }
  }

  const uploadProfilePicture = async () => {
    try {
      if (images.length > 0) {
        const image = images[0];
        if (image.file && userID) {
          const { data, error } = await supabase.storage.from('public').upload(`${userID}/${image.file.name}`, image.file, {upsert: true}); 
          if (error) throw error;
          const resp = supabase.storage.from('public').getPublicUrl(data.path);
          const publicUrl = resp.data.publicUrl;
          const updateUserResponse = await supabase
            .from('users')
            .update({profile_picture_url: publicUrl})
            .eq('id', userID);
          if (updateUserResponse.error) throw error;
          setProfilePictureUrl(publicUrl);
        }
      }
    }
    catch (error) {
      console.log("error: ", error);
    }
  }

  return (
    <div className="flex flex-col w-full justify-center items-center mt-4">
      {
        profilePictureUrl && (
        <Image
          className="rounded-full object-cover"
          src={profilePictureUrl}
          alt="profile picture"
          width={100}
          height={100}
        />)
      }
      {
        links?.map((link: Link, index: number) => (
          <div
            className="shadow-xl w-96 bg-indigo-500 mt-4 p-4 rounded-lg text-center text-white"
            key={index}
            onClick={(e) => {
            e.preventDefault();
            window.location.href = link.url;
            }}
          >
            {link.title}
          </div>
        ))
      }
      {
        !isLoading && isAuthenticated && (
          <>
          <div>
            <h1> New link creation</h1>
            <div className="mt-4">
                <div className="block text-sm font-medium text-gray-700">
                      Title
                </div>
                <input
                    type="text"
                    name="title"
                    id="title"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="my awesome link"
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mt-4">
                <div className="block text-sm font-medium text-gray-700">
                  URL
                </div>
                <input
                    type="text"
                    name="url"
                    id="url"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://github.com/YichuLi"
                    onChange={(e) => setUrl(e.target.value)}
                />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={addNewLink}
            >
              Add new link
            </button>
            </div>
            <div>
              <h1> Image Uploading</h1>
              {
                images.length > 0 && (<Image 
                  src = {images[0]['data_url']}
                  height={100}
                  width={100}
                  alt = "profile picture"
                />)
              }
              <ImageUploading
                multiple
                value={images}
                onChange={onChange}
                maxNumber={1}
                dataURLKey="data_url"
              >
                {({ onImageUpload, onImageRemoveAll, isDragging, dragProps }) => (
                  // write your building UI
                  <div className="upload__image-wrapper bg-slate-300 flex justify-center items-center rounded-lg" style={isDragging ? { color: "red" } : undefined} {...dragProps}>
                    {
                      images.length === 0 ? (
                        <button
                          style = {isDragging ? {color: "red"} : undefined}
                          onClick={onImageUpload}
                          {...dragProps}
                          className="w-3/4">
                          Click or Drop here
                          </button>
                      ) : (
                        <button onClick={onImageRemoveAll}>Remove all images</button>
                      )
                    }
                  </div>
                )}

              </ImageUploading>

              <button
              type="button"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={uploadProfilePicture}
              >
              Upload Profile Picture
            </button>
            </div>
          </>)
      }
    </div>
  )
}
