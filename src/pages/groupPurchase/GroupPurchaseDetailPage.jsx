import React, { useEffect, useState } from "react";
import "./GroupPurchaseDetailPage.css";
import sampleImg from "../../assets/sample.png";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";

export default function GroupPurchaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPost(res.data);
      } catch (err) {
        console.error("상세 정보 불러오기 실패", err);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) return <div>불러오는 중...</div>;

  const {
    title,
    description,
    totalAmount,
    totalQuantity,
    myQuantity,
    pricePerItem,
    participantLimit,
    categoryName,
    imageUrl,
  } = post;

  const availableQuantity = totalQuantity - myQuantity;

  return (
    <div className="detail-page">
      {/* 상단 바 */}
      <div className="top-bar">
        <FaChevronLeft
          size={24}
          className="back-btn"
          onClick={() => navigate(-1)}
        />
      </div>

      {/* 상품 이미지 */}
      <img
        src={
          imageUrl?.startsWith("/uploads/")
            ? `http://localhost:8080${imageUrl}`
            : imageUrl
            ? import.meta.env.BASE_URL + imageUrl
            : sampleImg
        }
        alt={title}
        className="product-image"
      />

      {/* 본문 정보 */}
      <div className="info-section">
        <h1 className="title">{title}</h1>
        <div className="sub-info">
          <span className="category">{categoryName}</span>
          <span className="nickname">{post.nickname ?? "닉네임"}</span>
        </div>

        <div className="description">{description}</div>

        <div className="detail-table">
          <div className="row">
            <span>총 금액</span>
            <span>{totalAmount.toLocaleString()} 원</span>
          </div>
          <div className="row">
            <span>총 수량</span>
            <span>{totalQuantity} 개</span>
          </div>
          <div className="row">
            <span>구매 가능 수량</span>
            <span>{availableQuantity} 개</span>
          </div>
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div className="bottom-bar">
        <div className="left-info">
          <div className="unit-price-label">1개 당 예상 금액</div>
          <div className="unit-price">{pricePerItem.toLocaleString()} 원</div>
        </div>
        <div className="member-info">
          {[...Array(participantLimit)].map((_, i) => (
            <span key={i} className={`dot ${i < myQuantity ? "" : "empty"}`} />
          ))}
        </div>
        <button
          className="chat-btn"
          onClick={async () => {
            try {
              const userId = localStorage.getItem("userId");
              if (!userId) {
                alert("로그인이 필요합니다.");
                return;
              }

              const res = await axios.post(
                "http://localhost:8080/chatrooms",
                {
                  postId: Number(id),
                  hostId: Number(userId),
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );

              const newChatRoomId = res.data; // ← POST 응답에서 받은 chatRoomId
              console.log("✅ ChatRoom 생성 응답:", res.data); // 여기에 id가 있는지 확인

              navigate(`/ChatRoom/${newChatRoomId}`);
            } catch (err) {
              console.error("채팅방 생성 실패", err);
              alert("채팅방 참여에 실패했습니다.");
            }
          }}
        >
          채팅방 참여
        </button>
      </div>
    </div>
  );
}
