import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, utils } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { WithContext as ReactTags } from "react-tag-input";
import axios from "axios";

import { Idl } from "@project-serum/anchor/dist/cjs/idl";
import React, {
  Component,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import { toast } from "react-toastify";
import { PublicKey } from "@solana/web3.js";
import idl from "../../idl.json";

import { constants } from "../../constants";
import { getOrCreateAssociatedTokenAccount } from "../../utils/transferSpl/getOrCreateAssociatedTokenAccount";
import { loadLocalStorage, profile, profileRoles } from "../../utils/store";
import { useAtom } from "jotai";

export interface EscrowData {
  randomSeed: number;
  initializerKey: PublicKey;
  initializerDepositTokenAccount: PublicKey;
  initializerAmount: Array<number>;
  admin1: PublicKey;
  resolver: PublicKey;
  admin2TokenAccount: PublicKey;
  pubkey: PublicKey;
  active: boolean;
  index: number;
}

interface Tag {
  id: string;
  text: string;
}

interface RemoveComponentProps {
  className: string;
  onRemove: Function;
}

const programID = new PublicKey(idl.metadata.address);

const Profile = () => {
  const { connection } = useConnection();
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();

  const [faqNum, setFaqNum] = useState(0);
  const [stage, setStage] = useState(0);
  const [currentEscrow, setCurrentEscrow] = useState(0);

  const [escrowData, setEscrowData] = useState<EscrowData[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [myStatus, setMyStatus] = useState("active");

  const [currentMilestone, setCurrentMilestone] = useState(5);
  const [description, setDescription] = useState("");
  const [moderator, setModerator] = useState(constants.moderator);
  const [amount, setAmount] = useState(500);
  const [milestone1, setMilestone1] = useState("");
  const [amount1, setAmount1] = useState(50);
  const [milestone2, setMilestone2] = useState("");
  const [amount2, setAmount2] = useState(150);
  const [milestone3, setMilestone3] = useState("");
  const [amount3, setAmount3] = useState(200);
  const [milestone4, setMilestone4] = useState("");
  const [amount4, setAmount4] = useState(50);
  const [milestone5, setMilestone5] = useState("");
  const [amount5, setAmount5] = useState(50);

  const [user, setUser] = useAtom(profile);
  const [note, setNote] = useState("");
  const noteRef = useRef(null);

  const opts = {
    preflightCommitment: "processed",
  };

  const [roles, setRoles] = useState([
    { id: "Moderator", text: "Moderator" },
    { id: "Artist", text: "Artist" },
    { id: "UI/UX", text: "UI/UX" },
  ]);

  const [selectedRoles, setSelectedRoles] = useAtom(profileRoles);

  const handleDelete = (i: number) => {
    setSelectedRoles(selectedRoles.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag: Tag) => {
    if (selectedRoles.findIndex((item) => item.text === tag.text) === -1) {
      setSelectedRoles([...selectedRoles, tag]);
    }
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newRoles = selectedRoles.slice();

    newRoles.splice(currPos, 1);
    newRoles.splice(newPos, 0, tag);

    // re-render
    setSelectedRoles(newRoles);
  };

  const getProvider = () => {
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }
    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new AnchorProvider(connection, signerWallet, {
      preflightCommitment: "recent",
    });

    return provider;
  };

  const createEscrow = async () => {
    if (
      currentMilestone > 0 &&
      amount !== amount1 + amount2 + amount3 + amount4 + amount5
    ) {
      toast(
        "Set the milestone payment correctly. Must be matched to total amount!"
      );
      return;
    }
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);

    const mint = new PublicKey(constants.mint);
    const admin1 = new PublicKey(constants.admin1);
    const admin2 = new PublicKey(constants.admin2);
    const resolver = new PublicKey(moderator);

    let admin2TokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      publicKey,
      mint,
      admin2,
      signTransaction
    );

    let initializerDepositTokenAccount =
      await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mint,
        publicKey,
        signTransaction
      );

    const { adminSeed, stateSeed, vaultSeed, authoritySeed } = constants;
    const randomSeed: anchor.BN = new anchor.BN(
      Math.floor(Math.random() * 100000000)
    );

    // Derive PDAs: escrowStateKey, vaultKey, vaultAuthorityKey
    const escrowStateKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(stateSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];
    const vaultKey = PublicKey.findProgramAddressSync(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode(vaultSeed)),
        randomSeed.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

    try {
      //post request will verify the lib.json and using metadata address it will verify the programID and create the block in solana
      const tx = await program.transaction.initialize(
        randomSeed,
        [
          new anchor.BN(amount1),
          new anchor.BN(amount2),
          new anchor.BN(amount3),
          new anchor.BN(amount4),
          new anchor.BN(amount5),
        ],
        {
          accounts: {
            initializer: provider.wallet.publicKey,
            vault: vaultKey,
            admin1,
            resolver,
            admin2TokenAccount: admin2TokenAccount.address,
            mint,
            initializerDepositTokenAccount:
              initializerDepositTokenAccount.address,
            escrowState: escrowStateKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          signers: [],
        }
      );
      tx.feePayer = provider.wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signedTx = await provider.wallet.signTransaction(tx);
      const txId = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txId);
      setStage(0);
    } catch (err) {
      // console.log(err.message);
      console.log(err);
    }
  };

  const getEscrow = async () => {
    const provider = getProvider(); //checks & verify the dapp it can able to connect solana network
    if (!provider || !publicKey || !signTransaction) return;
    const program = new Program(idl as Idl, programID, provider);
    try {
      let tmpLockedval = 0;
      await Promise.all(
        (
          await connection.getProgramAccounts(programID)
        ).map(
          async (
            tx,
            index //no need to write smartcontract to get the data, just pulling all transaction respective programID and showing to user
          ) => {
            const fetchData: any = await program.account.escrowState.fetch(
              tx.pubkey
            );
            const newData = {
              ...fetchData,
              initializerAmount: [
                Number(fetchData.initializerAmount[0]),
                Number(fetchData.initializerAmount[1]),
                Number(fetchData.initializerAmount[2]),
                Number(fetchData.initializerAmount[3]),
                Number(fetchData.initializerAmount[4]),
              ],
              randomSeed: Number(fetchData.randomSeed),
            };
            const lockedVal =
              newData.initializerAmount[0] +
              newData.initializerAmount[1] +
              newData.initializerAmount[2] +
              newData.initializerAmount[3] +
              newData.initializerAmount[4];
            tmpLockedval += lockedVal;
            return {
              ...newData,
              pubkey: tx.pubkey.toString(),
              active: lockedVal > 0 ? true : false,
              index,
            };
          }
        )
      ).then((result) => {
        setTotalValue(tmpLockedval);
        setEscrowData(result);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const saveProfile = () => {
    let roleArray: string[] = [];
    selectedRoles.forEach((item) => {
      roleArray.push(item.text);
    });

    axios({
      method: "put",
      url: `${process.env.REACT_APP_SERVER_URL}/users/${user.walletAddress}`,
      data: {
        note: note,
        roles: roleArray.toString(),
      },
    }).then((res) => {
      setUser(res.data);
    });
  };

  const handleChangeNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setUser(loadLocalStorage("user"));
  }, [window.localStorage]);

  useEffect(() => {
    console.log(publicKey, loadLocalStorage("user"));
  }, [publicKey]);

  return (
    <div className="min-h-[100vh] px-[20px] sm:px-[45px] pb-[75px]">
      <div className="flex items-center relative">
        <div className="font-[600] text-[22px] leading-[22px] pt-[130px]">
          My Profile
        </div>

        {user.walletAddress ? (
          <button
            className="mt-auto ml-auto bg-primary h-[50px] w-[120px] -translate-x-[2rem] translate-y-[2rem] rounded-[12px] hover:text-primary hover:bg-white"
            onClick={saveProfile}
          >
            <span className="text-4xl font-bold uppercase">Save</span>
          </button>
        ) : (
          ""
        )}
      </div>
      <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
        Create and update your profile within the Faceless ecosystem.
      </div>

      <div className="mt-[82px] rounded-[10px] bg-profile-card-bgcolor">
        <div className="py-[16px] px-[25px] font-[600] text-[22px] leading-[26px]">
          Connections
        </div>
        <div className="rounded-[10px] py-[45px] bg-profile-card-inner-bgcolor items-center justify-between px-[20px] sm:px-[45px] grid xl:grid-cols-2 grid-cols-1 gap-[3rem]">
          <div className="flex items-center flex-col sm:flex-row">
            <div className="w-[150px] h-[150px] bg-white rounded-[200px] cursor-pointer mb-[1rem] sm:mb-0"></div>
            <div className="sm:ml-[33px] ml-0">
              <div className="w-[214px] h-[45px] rounded-[5px] bg-[#7c98a9] flex items-center pl-[21px] cursor-pointer">
                <div className="bg-twitter bg-cover w-[21px] h-[21px]"></div>
                <div className="ml-[18px] text-[20px] leading-[23px] font-[400]">
                  @twitteruser
                </div>
              </div>
              <div className="mt-[21px] w-[214px] h-[45px] rounded-[5px] bg-[#7c98a9] flex items-center pl-[21px] cursor-pointer">
                <div className="bg-twitter bg-cover w-[21px] h-[21px]"></div>
                <div className="ml-[18px] text-[20px] leading-[23px] font-[400]">
                  @discorduser
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="text-[20px] leading-[23px] font-[300] text-center sm:text-left">
              Connect your Solana wallet. Keep in mind, your reviews and scores
              are registered to only one wallet.
            </div>
            <div className="mt-[37px] flex items-center flex-wrap justify-center sm:justify-start">
              {user?.walletAddress ? (
                <>
                  <div className="bg-[#7c98a9] rounded-[5px] flex justify-center items-center text-[20px] leading-[23px] font-[800] py-[10px] px-[14px] mr-[1rem] cursor-pointer mb-[1rem]">
                    Disconnect
                  </div>
                  <div className="bg-[#1c262d] rounded-[9px] flex justify-center items-center text-[20px] leading-[23px] font-[700] py-[16px] px-[13px] cursor-pointer mb-[1rem] max-w-full truncate">
                    {user.walletAddress}
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[40px] rounded-[10px] bg-profile-card-bgcolor">
        <div className="py-[16px] px-[25px] font-[600] text-[22px] leading-[26px]">
          Profile
        </div>
        <div className="py-[45px] rounded-[10px] bg-profile-card-inner2-bgcolor justify-between px-[20px] sm:px-[45px] leading-[23px] text-[20px] grid lg:grid-cols-2 grid-cols-1 gap-[3rem]">
          <div>
            <div className="font-[300]">
              Write a short description about yourself
            </div>
            <div className="mt-[31px]">
              <textarea
                className="h-[130px] w-full bg-[#1c1c1c] rounded-[9px] p-[1rem]"
                defaultValue={user.note ? user.note : ""}
                onChange={handleChangeNote}
              />
            </div>
          </div>
          <div className="">
            <div className="text-[20px] leading-[23px] font-[300]">
              Select skills that best suit you
            </div>
            <div className="mt-[31px] w-full rounded-[9px] p-[1rem] pb-0 bg-[#1C1C1C]">
              <ReactTags
                inputFieldPosition="inline"
                tags={selectedRoles}
                suggestions={roles}
                handleDelete={handleDelete}
                handleAddition={handleAddition}
                handleDrag={handleDrag}
                placeholder="new"
                autocomplete
              />
            </div>

            <div className="mt-[16px] flex flex-wrap">
              {roles.map((role, index) => (
                <div
                  className="bg-[#7c98a9] rounded-[10px] text-sm py-[.5rem] mb-[1rem] sm:w-[130px] w-[100px] text-center text-white cursor-pointer mr-[1rem]"
                  key={`role-${index}`}
                  onClick={() => handleAddition(role)}
                >
                  <span>+ {role.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
