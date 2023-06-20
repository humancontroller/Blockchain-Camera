import { useState, useEffect } from "react";
import { NFTStorage, File } from "nft.storage";
import useWeb3 from "../hooks/useWeb3";

const nftName = "HDEASHD #"
const nftDescription = "This is not NFT Art. This is the NFT that was minted with the NFT Camera during NFT Camera development.";

const nftStorage = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

const obj_max = 5

const store = async (name, description, data, fileName, type, attributes, sha256) => {
  const metadata = await nftStorage.store({
    name,
    description,
    image: new File([data], fileName, { type }),
    attributes,
    sha256,
  });
  console.log(metadata);
  return metadata;
};


function b64DecodeUnicode(str) {
  var binaryStr = atob(str);

  var utf8Str = '';
  for (var i = 0; i < binaryStr.length; i++) {
    utf8Str += String.fromCharCode(binaryStr.charCodeAt(i));
  }

  var bytes = new Uint8Array(utf8Str.length);
  for (var j = 0; j < utf8Str.length; j++) {
    bytes[j] = utf8Str.charCodeAt(j);
  }

  return bytes;
}


export const ERC721Camera = () => {
  const { userAddress, mintNFT } = useWeb3();
  const [blob, setBlob] = useState(null);
  const [base64, setBase64] = useState(null);
  const [onGoing, setOnGoing] = useState(false);

  const [fileName, setFileName] = useState("photo.jpg");
  const [type, setType] = useState("image/jpeg");
  const [name, setName] = useState("");
  const [description, setDescription] = useState(nftDescription);

  const { getTokenURI } = useWeb3();
  const [name2, setName2] = useState("");
  const [image, setImage] = useState("");
  const {getTotalSupply} = useWeb3();

  const [objects, setObjects] = useState("");
  const [sha256, setSha256] = useState("");

  const readAsBlob = (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      setBlob(reader.result);
    };
  };

  const readAsBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setBase64(reader.result);
    };
  };

  const submit = async () => {
    console.log("name : " + name);
    console.log("description : " + description);
    console.log("blob : " + blob);
    console.log("fileName : " + fileName);
    console.log("type : " + type);

    let attributes = [];
    const obj_cnt = objects.length

    attributes[0] = {trait_type: 'Obj Count', value: obj_cnt}

    for (let i=1; i<=obj_max; i++) {
      if (i <= obj_cnt) {
        attributes[i] = {trait_type: 'Obj'+i, value: objects[i-1]}
      }
      else {
        attributes[i] = {trait_type: 'Obj'+i, value: 'none'}
      }
    }
    console.log(attributes)


    setOnGoing(true);
    try {
      const metadata = await store(name, description, blob, fileName, type, attributes, sha256);
      const inputUrl = metadata.url.replace(/^ipfs:\/\//, "");

      const tx = await mintNFT(userAddress, inputUrl);
      const receipt = await tx.wait();
      console.log(receipt);

      const id = await getTotalSupply() - 1;
      const tokenUri = await getTokenURI(id);
      const url = await tokenUri.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
      const res = await fetch(url);
      const data = await res.json();

      await setName2(data.name);
      await setBase64(data.image.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/"));

    } catch (err) {
      console.error(err);
    } finally {
      setOnGoing(false);
    }
  };

  var webSocket;
  var messageTextArea = document.getElementById("messageTextArea");

  const connect = () => {

    webSocket = new WebSocket("ws://localhost:8001");

    webSocket.onopen = function(message){
      //messageTextArea.value += "Server connect... OK\n";
    };

    webSocket.onclose = function(message){
      //messageTextArea.value += "Server Disconnect... OK\n";
    };

    webSocket.onerror = function(message){
      //messageTextArea.value += "error...\n";
    };

    webSocket.onmessage = async function(message){
      setOnGoing(true);
      setBase64(null);
      setName(null);
      const nextId = await getTotalSupply();

      await setName(nftName + nextId.toString());

      var jsonData = await JSON.parse(message.data)
      var decodeImage = await b64DecodeUnicode(jsonData.image)
      var blobImage= await new Blob([decodeImage], { type: 'image/jpeg' });

      await setObjects(jsonData.objects)
      await setFileName(jsonData.filename)
      await setSha256(jsonData.sha256)

      await readAsBlob(blobImage);
      await readAsBase64(blobImage);

      console.log(jsonData.objects)
    };
  };

  function disconnect(){
    webSocket.close();
  };

  useEffect(() => {
    if (blob != null) {
      submit();
    }
  }, [blob]);

  window.onload = async function(){
    connect();
  }

  return (
    <div className="wrapper">
      {base64 ? (
        <>
          <img src={base64} alt="image" className="image" />
          {onGoing ? (
            <>
              <div className="name">Minting...</div>
              <div className="objects">{objects.length}</div>
            </>
          ) : (
            <>
              <div className="name">{name2}</div>
            </>
          )}

        </>
      ) : (
        <>
          <div className = "title">NFT</div>
        </>
      )}
    </div>
  );
};
