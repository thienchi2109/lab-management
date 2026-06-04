import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const SOURCE_ROOTS = ["app", "components", "lib"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const IGNORED_SUFFIXES = [".test.ts", ".test.tsx", ".d.ts"];

const UNACCENTED_VIETNAMESE_PHRASES = [
  "Tai khoan",
  "tai khoan",
  "hien tai",
  "khong",
  "Khong",
  "quyen",
  "danh sach",
  "tao user",
  "hoac",
  "thay doi",
  "Quan ly",
  "quan ly",
  "nguoi dung",
  "vai tro",
  "trang thai",
  "Them",
  "Tim theo ten",
  "Tat ca",
  "Hoat dong",
  "Tam khoa",
  "Dang hien thi",
  "Thu doi",
  "tu khoa",
  "bo loc",
  "Cap nhat",
  "Tac vu",
  "Mat khau",
  "Ten hien thi",
  "Dong",
  "Huy",
  "Dang luu",
  "Luu thay doi",
  "Thong tin",
  "Chua ro",
  "Tong",
  "dang nhap",
  "Dang nhap",
  "Dang xuat",
  "mat khau",
  "Chao",
  "Theo doi",
  "mau xet nghiem",
  "ket qua",
  "bao cao",
  "cai dat",
  "hom nay",
  "gan day",
  "sap het han",
  "ton kho",
  "du lieu",
  "he thong",
  "can cau hinh",
  "thanh cong",
  "that bai",
  "thu lai",
  "xac thuc",
  "phien",
  "lam moi",
  "trinh duyet",
  "ban quyen",
  "lien he",
  "moi nhat",
  "nho hon",
  "truoc",
  "sau",
  "tuan nay",
  "thang nay",
  "nam nay",
  "dang cho",
  "cho xu ly",
  "hoan tat",
  "gui",
  "chon",
  "so luong",
  "gia tri",
  "muc do",
  "rui ro",
];

describe("Vietnamese user-facing copy", () => {
  test("does not use common unaccented Vietnamese phrases", () => {
    const violations = productionSourceFiles()
      .flatMap((file) => {
        const source = readFileSync(file, "utf8");
        return UNACCENTED_VIETNAMESE_PHRASES.filter((phrase) =>
          source.includes(phrase)
        ).map((phrase) => `${path.relative(process.cwd(), file)}: ${phrase}`);
      })
      .sort();

    expect(violations).toEqual([]);
  });
});

function productionSourceFiles(): string[] {
  return SOURCE_ROOTS.flatMap((root) => walk(path.join(process.cwd(), root)));
}

function walk(targetPath: string): string[] {
  if (statSync(targetPath).isDirectory()) {
    return readdirSync(targetPath).flatMap((entry) =>
      walk(path.join(targetPath, entry))
    );
  }

  if (
    !SOURCE_EXTENSIONS.has(path.extname(targetPath)) ||
    IGNORED_SUFFIXES.some((suffix) => targetPath.endsWith(suffix))
  ) {
    return [];
  }

  return [targetPath];
}
