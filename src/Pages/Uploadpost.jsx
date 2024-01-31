import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { Select, SelectItem } from "@nextui-org/react";
import { IoIosAdd } from "react-icons/io";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import { database, storage } from "../Appwrite/auth";
import { useEffect } from "react";
import { account } from "../Appwrite/auth";
import { ID, Query } from "appwrite";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function Uploadpost() {
  const editorRef = useRef(null);
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [mainBody, setMainBody] = useState("");
  const [publish, setPublish] = useState("Public");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [userId, setUserId] = useState(null);
  const [imageId, setImageId] = useState("");
  const [userName, setUserName]= useState("")
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userDetail = await account.get();
        setUserName(userDetail.name)
        setUserId(userDetail.$id);
      } catch (error) {
        console.log(error);
      }
    };

    getCurrentUser();
  });

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  useEffect(() => {
    if (id) {
      const fatchData = async () => {
        try {
          const postData = await database.getDocument(
            "65b340358ea3657276f8",
            "65b34045850ba70f6fec",
            id
          );

          if (postData) {
            setTitle(postData.title);
            setSummary(postData.summary);
            setMainBody(postData.content);
            setPublish(postData.publish);
            setAuthor(postData.author);
            setCategory(postData.category);
            setCoverImage(postData.image);
            setImageId(postData.imageId);

            if (editorRef.current) {
              editorRef.current.setContent(postData.content);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };
      fatchData();
    }
  }, [id]);

  const handleUploadPost = async () => {
    if (editorRef.current) {
      const editorContent = editorRef.current.getContent();
      setMainBody(editorContent);

      const postData = {
        title,
        summary,
        mainBody: editorContent,
        publish,
        author,
        category,
        coverImage,
      };

      if (id) {
        if (coverImage instanceof File) {
          const deleteImage = await storage.deleteFile(
            "65b4c5c0bbec74de98e3",
            imageId
          );

          const uploadImage = await storage.createFile(
            "65b4c5c0bbec74de98e3",
            ID.unique(),
            coverImage
          );

          const previewImage = await storage.getFilePreview(
            "65b4c5c0bbec74de98e3",
            uploadImage.$id
          );

          await handleUpdatePost(
            id,
            postData.title,
            postData.summary,
            postData.mainBody,
            postData.publish,
            postData.author,
            postData.category,
            previewImage.href,
            uploadImage.$id
          );
        } else {
          handleUpdatePost(
            id,
            postData.title,
            postData.summary,
            postData.mainBody,
            postData.publish,
            postData.author,
            postData.category,
            postData.coverImage
          );
        }
      } else {
        handlePostData(
          postData.title,
          postData.summary,
          postData.mainBody,
          postData.publish,
          postData.author,
          postData.category,
          postData.coverImage,
          userName
        );
      }
    }
  };

  const handlePostData = async (title, sum, main, pub, auth, cate, img, username) => {
    const imageUpload = await storage.createFile(
      "65b4c5c0bbec74de98e3",
      "unique()",
      img
    );

    const imageFile = await storage.getFilePreview(
      "65b4c5c0bbec74de98e3",
      imageUpload.$id
    );

    try {
      const data = await database.createDocument(
        "65b340358ea3657276f8",
        "65b34045850ba70f6fec",
        ID.unique(),
        {
          title,
          content: main,
          summary: sum,
          category: cate,
          author: auth,
          publish: pub,
          image: imageFile.href,
          userid: userId,
          imageId: imageUpload.$id,
          username : userName
        }
      );
      navigate("/profile");
      window.location.reload();
    } catch (error) {
      console.log("not uploaded on database", error);
    }
  };

  const handleUpdatePost = async (
    postId,
    title,
    sum,
    main,
    pub,
    auth,
    cate,
    img,
    imgid
  ) => {
    try {
      const updatedData = await database.updateDocument(
        "65b340358ea3657276f8",
        "65b34045850ba70f6fec",
        postId,
        {
          title,
          content: main,
          summary: sum,
          category: cate,
          author: auth,
          publish: pub,
          image: img,
          imageId: imgid,
        }
      );
      navigate("/profile");
      window.location.reload();
    } catch (error) {
      console.log("upadting ", error);
    }
  };

  return (
    <div className="bg-[rgb(234,237,241)] font-sans">
      <div className="w-full flex justify-center items-center bg-[url(https://static.wixstatic.com/media/5bfb6f_26f1a5c736e544e09c63c82a4c792645~mv2_d_3839_1306_s_2.jpg/v1/fill/w_1517,h_653,al_b,q_85,usm_0.66_1.00_0.01,enc_auto/5bfb6f_26f1a5c736e544e09c63c82a4c792645~mv2_d_3839_1306_s_2.jpg)] h-[200px] object-cover bg-no-repeat bg-center">
        <h1 className="text-4xl text-white">Upload Post</h1>
      </div>
      <div className="px-4 flex gap-4">
        <div className="w-[1400px]">
          <div className="bg-white rounded-xl mt-5 w-full px-4 py-4">
            <label htmlFor="ti">
              <h3 className="text-lg font-medium">Title</h3>
            </label>
            <input
              type="text"
              placeholder="Publish a blog as New Product for newly relased products"
              className="w-full bg-white px-2 border-[#D7DBE7] border-2 border-solid outline-none py-1 rounded-md text-sm mt-2"
              id="ti"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-xl mt-5 w-full px-4 py-4">
            <h3 className="text-lg font-medium">Content</h3>
            <hr className="mt-3" />
            <div className="mt-4 ">
              <label htmlFor="sumr">
                <h3 className="text-lg font-medium">Summary</h3>
              </label>
              <input
                type="text"
                placeholder="Publish a blog as New Product for newly relased products"
                className="w-full bg-white px-2 border-[#D7DBE7] border-2 border-solid outline-none py-1 rounded-md text-sm mt-2"
                id="sumr"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            <div className=" w-full mt-6">
              <h3 className="text-lg font-medium mb-4">Main Body</h3>
              <Editor
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue="<p>This is the initial content of the editor.</p>"
                init={{
                  height: 400,
                  menubar: false,
                  resize: false,
                  plugins: [
                    "advlist autolink lists link image charmap print preview anchor",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste code help wordcount",
                  ],
                  menubar: "file edit view insert format tools table help",
                  toolbar:
                    "undo redo | formatselect | " +
                    "bold italic backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  quickbars_selection_toolbar:
                    "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
              />
              <button onClick={log}>Log editor content</button>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl mt-5 w-full px-4 py-4">
            <h3 className="text-lg font-medium">Publish a blog</h3>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="Public"
              name="radio-buttons-group"
              onChange={(e) => setPublish(e.target.value)}
            >
              <FormControlLabel
                value="Public"
                control={<Radio />}
                label="Public"
              />
              <FormControlLabel
                value="Private"
                control={<Radio />}
                label="Private"
                className="-mt-2"
              />
            </RadioGroup>
          </div>
          <div className="bg-white rounded-xl mt-5 w-full px-4 py-4">
            <label htmlFor="authorname">
              <h3 className="text-lg font-medium">Author</h3>
            </label>
            <input
              type="text"
              placeholder="Author name"
              className="w-full bg-white px-2 border-[#D7DBE7] border-2 border-solid outline-none py-1 rounded-md text-sm mt-2"
              id="authorname"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <div className="mt-4">
              <h3 className="text-lg font-medium">
                include in a blog category
              </h3>
              <Select
                placeholder="Select a Category"
                className="max-w-xs font-sans mt-3"
                aria-label="Select a Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <SelectItem value="news" key="news" className="font-sans">
                  News
                </SelectItem>
                <SelectItem
                  value="technology"
                  key="technology"
                  className="font-sans"
                >
                  Tchnology
                </SelectItem>
                <SelectItem value="sports" key="sports" className="font-sans">
                  Sports
                </SelectItem>
                <SelectItem value="travle" key="travle" className="font-sans">
                  Travles
                </SelectItem>
              </Select>
            </div>
          </div>
          <div className="bg-white rounded-xl mt-5 w-full px-4 py-4">
            <h3 className="text-lg font-medium">Cover image</h3>
            <p className="text-sm">
              Spports uploads of JPG, PNG, WEBP and GIF image with the maximum 4
              mb
            </p>
            <div className="mt-4">
              <input
                type="file"
                name=""
                id="files"
                className="hidden"
                onChange={(e) => setCoverImage(e.target.files[0])}
              />
              <label htmlFor="files">
                <div className="w-full aspect-[2/1] flex flex-col justify-center items-center text-[rgb(71,79,95)] cursor-pointer border-2 border-dashed rounded-md ">
                  <IoIosAdd className="text-6xl text-[rgb(71,79,95)]" />
                  <p>Add image</p>
                </div>
              </label>
            </div>
          </div>
          <Button
            color="primary"
            className="mt-10 py-6 w-full"
            onClick={handleUploadPost}
          >
            Upload post
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Uploadpost;
